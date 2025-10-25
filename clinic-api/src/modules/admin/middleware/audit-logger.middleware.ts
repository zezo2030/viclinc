import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminAudit, AdminAuditDocument, AuditAction } from '../schemas/admin-audit.schema';

@Injectable()
export class AuditLoggerMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(AdminAudit.name)
    private readonly adminAuditModel: Model<AdminAuditDocument>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Only audit admin routes
    if (!req.path.startsWith('/v1/admin')) {
      return next();
    }

    // Skip audit for certain endpoints
    const skipAuditPaths = [
      '/v1/admin/system/health',
      '/v1/admin/system/logs',
    ];

    if (skipAuditPaths.includes(req.path)) {
      return next();
    }

    const startTime = Date.now();
    const originalSend = res.send;

    // Override res.send to capture response
    const self = this;
    res.send = function(body: any) {
      const duration = Date.now() - startTime;
      
      // Log audit asynchronously (don't block response)
      setImmediate(async () => {
        try {
          await self.logAdminAction(req, res, duration, body);
        } catch (error) {
          console.error('Audit logging error:', error);
        }
      });

      return originalSend.call(this, body);
    }.bind(res);

    next();
  }

  private async logAdminAction(req: Request, res: Response, duration: number, responseBody: any) {
    const user = (req as any).user;
    if (!user || user.role !== 'ADMIN') {
      return; // Only log admin actions
    }

    const action = this.determineAction(req.method, req.path);
    if (!action) {
      return; // Skip if action cannot be determined
    }

    const auditData: any = {
      adminId: user.sub,
      action,
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent'),
      metadata: {
        method: req.method,
        path: req.path,
        query: req.query,
        body: this.sanitizeRequestBody(req.body),
        statusCode: res.statusCode,
        duration,
        timestamp: new Date().toISOString(),
        isImpersonation: user.isImpersonation || false,
        originalUserId: user.originalUserId,
        sessionId: user.sessionId,
      },
      success: res.statusCode < 400,
    };

    // Add target user ID if applicable
    if (this.hasTargetUserId(req.path, req.method)) {
      const targetUserId = this.extractTargetUserId(req);
      if (targetUserId) {
        auditData.targetUserId = targetUserId;
      }
    }

    // Add response data for certain actions
    if (this.shouldLogResponse(action)) {
      auditData.metadata.response = this.sanitizeResponseBody(responseBody);
    }

    try {
      await this.adminAuditModel.create(auditData);
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  private determineAction(method: string, path: string): AuditAction | null {
    // Map HTTP methods and paths to audit actions
    const actionMap: Record<string, Record<string, AuditAction>> = {
      'GET': {
        '/v1/admin/users': AuditAction.VIEW_SENSITIVE_DATA,
        '/v1/admin/doctors': AuditAction.VIEW_SENSITIVE_DATA,
        '/v1/admin/appointments': AuditAction.VIEW_SENSITIVE_DATA,
        '/v1/admin/metrics': AuditAction.VIEW_SENSITIVE_DATA,
        '/v1/admin/reports': AuditAction.VIEW_SENSITIVE_DATA,
        '/v1/admin/system/audit': AuditAction.VIEW_SENSITIVE_DATA,
      },
      'POST': {
        '/v1/admin/login-as': AuditAction.LOGIN_AS,
        '/v1/admin/departments/import': AuditAction.IMPORT_DATA,
        '/v1/admin/services/import': AuditAction.IMPORT_DATA,
        '/v1/admin/system/backup': AuditAction.CREATE_BACKUP,
      },
      'PATCH': {
        '/v1/admin/users': AuditAction.UPDATE_USER_ROLE,
        '/v1/admin/doctors': AuditAction.UPDATE_DOCTOR_STATUS,
        '/v1/admin/appointments': AuditAction.UPDATE_APPOINTMENT_STATUS,
      },
    };

    // Check for exact path match first
    if (actionMap[method] && actionMap[method][path]) {
      return actionMap[method][path];
    }

    // Check for pattern matches
    for (const [pattern, action] of Object.entries(actionMap[method] || {})) {
      if (path.startsWith(pattern.replace('*', ''))) {
        return action;
      }
    }

    // Default actions based on method
    switch (method) {
      case 'GET':
        return AuditAction.VIEW_SENSITIVE_DATA;
      case 'POST':
        return AuditAction.IMPORT_DATA;
      case 'PATCH':
        return AuditAction.UPDATE_USER_ROLE;
      case 'DELETE':
        return AuditAction.UPDATE_USER_STATUS;
      default:
        return null;
    }
  }

  private hasTargetUserId(path: string, method: string): boolean {
    const targetPaths = [
      '/v1/admin/users/',
      '/v1/admin/doctors/',
      '/v1/admin/appointments/',
    ];

    return targetPaths.some(targetPath => path.includes(targetPath));
  }

  private extractTargetUserId(req: Request): string | null {
    const pathSegments = req.path.split('/');
    
    // Extract ID from paths like /v1/admin/users/:id/role
    if (pathSegments.includes('users') || pathSegments.includes('doctors') || pathSegments.includes('appointments')) {
      const idIndex = pathSegments.findIndex(segment => 
        segment === 'users' || segment === 'doctors' || segment === 'appointments'
      );
      if (idIndex !== -1 && pathSegments[idIndex + 1]) {
        return pathSegments[idIndex + 1];
      }
    }

    // Extract from request body for certain actions
    if (req.body && req.body.userId) {
      return req.body.userId;
    }

    return null;
  }

  private shouldLogResponse(action: AuditAction): boolean {
    const responseActions = [
      AuditAction.LOGIN_AS,
      AuditAction.IMPORT_DATA,
      AuditAction.CREATE_BACKUP,
    ];

    return responseActions.includes(action);
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeResponseBody(body: any): any {
    if (!body) return body;

    // Limit response size
    const bodyStr = JSON.stringify(body);
    if (bodyStr.length > 1000) {
      return { message: 'Response too large to log', size: bodyStr.length };
    }

    return this.sanitizeRequestBody(body);
  }

  private getClientIP(req: Request): string {
    return (
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection as any)?.socket?.remoteAddress ||
      'unknown'
    );
  }
}
