import { Controller, Post, Delete, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SaveDeviceTokenDto, DeleteDeviceTokenDto } from './dto/save-device-token.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save device token for push notifications' })
  @ApiResponse({ status: 200, description: 'Device token saved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveDeviceToken(@Request() req: any, @Body() dto: SaveDeviceTokenDto) {
    const userId = req.user?.sub || req.user?.id;
    return await this.notificationsService.saveDeviceToken(userId, dto);
  }

  @Delete('token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete device token for push notifications' })
  @ApiResponse({ status: 204, description: 'Device token deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteDeviceToken(@Request() req: any, @Body() dto: DeleteDeviceTokenDto) {
    const userId = req.user?.sub || req.user?.id;
    await this.notificationsService.deleteDeviceToken(userId, dto);
  }
}

