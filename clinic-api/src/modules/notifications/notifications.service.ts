import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { DeviceToken, DeviceTokenDocument } from './schemas/device-token.schema';
import { SaveDeviceTokenDto, DeleteDeviceTokenDto } from './dto/save-device-token.dto';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseApp: admin.app.App | null = null;

  constructor(
    @InjectModel(DeviceToken.name)
    private readonly deviceTokenModel: Model<DeviceTokenDocument>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.initializeFirebase();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  private async initializeFirebase(): Promise<void> {
    try {
      // Check if Firebase is already initialized
      if (admin.apps.length > 0) {
        this.firebaseApp = admin.apps[0];
        this.logger.log('Firebase Admin SDK already initialized');
        return;
      }

      // Get service account key from environment or config
      const serviceAccountPath = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');
      const serviceAccountKey = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_KEY');

      if (serviceAccountPath) {
        // Initialize from file path
        // المسار في .env يمكن أن يكون نسبي من new (./clinic-api/config/...)
        // أو نسبي من clinic-api (./config/...)
        const path = require('path');
        let resolvedPath = serviceAccountPath;
        
        // إذا كان المسار يبدأ بـ ./clinic-api/، نحوله إلى مسار نسبي من clinic-api
        // لأن process.cwd() سيكون clinic-api عند تشغيل Backend
        if (serviceAccountPath.startsWith('./clinic-api/')) {
          resolvedPath = serviceAccountPath.replace('./clinic-api/', './');
        }
        
        // تحويل المسار النسبي إلى مطلق
        if (!path.isAbsolute(resolvedPath)) {
          resolvedPath = path.resolve(process.cwd(), resolvedPath);
        }
        
        // Check if file exists before requiring it
        if (!existsSync(resolvedPath)) {
          this.logger.warn(
            `Firebase service account file not found at ${resolvedPath}. Firebase notifications will be disabled.`,
          );
          return;
        }
        
        const serviceAccount = require(resolvedPath);
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.logger.log(`Firebase Admin SDK initialized from file: ${resolvedPath}`);
      } else if (serviceAccountKey) {
        // Initialize from base64 encoded JSON string
        const serviceAccount = JSON.parse(
          Buffer.from(serviceAccountKey, 'base64').toString('utf-8'),
        );
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.logger.log('Firebase Admin SDK initialized from environment variable');
      } else {
        // Try to use default credentials (for Google Cloud environments)
        try {
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
          });
          this.logger.log('Firebase Admin SDK initialized with default credentials');
        } catch (error) {
          this.logger.warn(
            'Firebase Admin SDK not initialized. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_KEY',
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
      // Don't throw error - allow API to start without Firebase
      // Firebase-dependent features will be disabled but API will still work
      this.logger.warn(
        'API will continue without Firebase notifications. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_KEY to enable.',
      );
    }
  }

  /**
   * Save or update device token for a user
   */
  async saveDeviceToken(userId: string, dto: SaveDeviceTokenDto): Promise<DeviceTokenDocument> {
    try {
      const userObjectId = new Types.ObjectId(userId);

      // Check if token already exists
      const existingToken = await this.deviceTokenModel.findOne({
        deviceToken: dto.deviceToken,
      });

      if (existingToken) {
        // Update existing token
        existingToken.userId = userObjectId;
        existingToken.platform = dto.platform;
        await existingToken.save();
        this.logger.log(`Device token updated for user ${userId}`);
        return existingToken;
      }

      // Create new token
      const deviceToken = new this.deviceTokenModel({
        userId: userObjectId,
        deviceToken: dto.deviceToken,
        platform: dto.platform,
      });

      await deviceToken.save();
      this.logger.log(`Device token saved for user ${userId}`);
      return deviceToken;
    } catch (error) {
      this.logger.error(`Failed to save device token for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Delete device token
   */
  async deleteDeviceToken(userId: string, dto: DeleteDeviceTokenDto): Promise<void> {
    try {
      const userObjectId = new Types.ObjectId(userId);

      await this.deviceTokenModel.deleteOne({
        userId: userObjectId,
        deviceToken: dto.deviceToken,
      });

      this.logger.log(`Device token deleted for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete device token for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get all device tokens for a user
   */
  async getUserDeviceTokens(userId: string | Types.ObjectId): Promise<DeviceTokenDocument[]> {
    try {
      // Handle both string and ObjectId
      let userObjectId: Types.ObjectId;
      if (userId instanceof Types.ObjectId) {
        userObjectId = userId;
      } else if (typeof userId === 'string') {
        // Check if it's already a valid ObjectId string
        if (Types.ObjectId.isValid(userId)) {
          userObjectId = new Types.ObjectId(userId);
        } else {
          throw new Error(`Invalid ObjectId string: ${userId}`);
        }
      } else {
        throw new Error(`Invalid userId type: ${typeof userId}`);
      }
      return await this.deviceTokenModel.find({ userId: userObjectId }).exec();
    } catch (error) {
      this.logger.error(`Failed to get device tokens for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Send notification to a single device token
   */
  async sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    if (!this.firebaseApp) {
      this.logger.warn('Firebase Admin SDK not initialized. Cannot send notification.');
      return;
    }

    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title,
          body,
        },
        data: data ? this.convertDataToString(data) : undefined,
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Notification sent successfully: ${response}`);
    } catch (error) {
      this.logger.error(`Failed to send notification to token ${token.substring(0, 20)}...`, error);
      throw error;
    }
  }

  /**
   * Send notification to all devices of a user
   */
  async sendNotificationToUser(
    userId: string | Types.ObjectId,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    try {
      const deviceTokens = await this.getUserDeviceTokens(userId);

      if (deviceTokens.length === 0) {
        this.logger.debug(`No device tokens found for user ${userId} - notification skipped`);
        return;
      }

      const tokens = deviceTokens.map((dt) => dt.deviceToken);

      // Send to all tokens
      await this.sendBulkNotifications(tokens, title, body, data);
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Send notification to multiple device tokens
   */
  async sendBulkNotifications(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    if (!this.firebaseApp) {
      this.logger.warn('Firebase Admin SDK not initialized. Cannot send notifications.');
      return;
    }

    if (tokens.length === 0) {
      this.logger.warn('No tokens provided for bulk notification');
      return;
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
        },
        data: data ? this.convertDataToString(data) : undefined,
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(
        `Bulk notification sent: ${response.successCount} successful, ${response.failureCount} failed`,
      );

      // Remove invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error?.code === 'messaging/invalid-registration-token') {
            invalidTokens.push(tokens[idx]);
          }
        });

        if (invalidTokens.length > 0) {
          await this.deviceTokenModel.deleteMany({ deviceToken: { $in: invalidTokens } });
          this.logger.log(`Removed ${invalidTokens.length} invalid device tokens`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to send bulk notifications', error);
      throw error;
    }
  }

  /**
   * Convert data object to string format required by FCM
   */
  private convertDataToString(data: Record<string, any>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return result;
  }
}

