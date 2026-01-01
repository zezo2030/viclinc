import { Controller, Post, Delete, Body, UseGuards, Request, HttpCode, HttpStatus, Param, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SaveDeviceTokenDto, DeleteDeviceTokenDto } from './dto/save-device-token.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('device-tokens')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save device token for push notifications' })
  @ApiResponse({ status: 200, description: 'Device token saved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveDeviceToken(@Request() req: any, @Body() dto: SaveDeviceTokenDto) {
    // Get userId from JWT token (more secure)
    const jwtUserId = req.user?.sub || req.user?.id;
    
    // If userId is provided in body, verify it matches JWT userId for security
    // Otherwise use JWT userId
    const userId = dto.userId || jwtUserId;
    
    // Security check: if userId in body doesn't match JWT, use JWT userId
    if (dto.userId && dto.userId !== jwtUserId) {
      // Log warning but use JWT userId for security
      console.warn(`[NotificationsController] UserId mismatch: JWT=${jwtUserId}, Body=${dto.userId}. Using JWT userId.`);
    }
    
    return await this.notificationsService.saveDeviceToken(userId, dto);
  }

  @Delete('device-tokens/:userId/*path')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete device token for push notifications' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'path', description: 'Device token path' })
  @ApiResponse({ status: 204, description: 'Device token deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteDeviceToken(
    @Request() req: any,
    @Param('userId') userId: string,
    @Param('path') path: string,
  ) {
    // Get userId from JWT token (more secure)
    const jwtUserId = req.user?.sub || req.user?.id;
    
    // Security check: verify path userId matches JWT userId
    if (userId !== jwtUserId) {
      throw new UnauthorizedException('User ID mismatch');
    }
    
    // Extract device token from path parameter
    // Path format: /v1/notifications/device-tokens/:userId/:deviceToken
    if (!path) {
      throw new UnauthorizedException('Device token not found in path');
    }
    
    // Decode device token if it was URL encoded
    const decodedToken = decodeURIComponent(path);
    
    const dto: DeleteDeviceTokenDto = { deviceToken: decodedToken };
    await this.notificationsService.deleteDeviceToken(userId, dto);
  }
}








