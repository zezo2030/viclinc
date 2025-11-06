import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateAgoraSettingsDto, AgoraSettingsResponseDto, TestAgoraConnectionDto } from './dto/update-agora-settings.dto';
import { SystemSettingsResponseDto, UpdateSettingsRequestDto } from './dto/system-settings.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../shared/guards/admin-role.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { User } from '../users/schemas/user.schema';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('admin/settings')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('agora')
  @ApiOperation({ summary: 'Get Agora settings' })
  @ApiResponse({ 
    status: 200, 
    description: 'Agora settings retrieved successfully',
    type: AgoraSettingsResponseDto
  })
  async getAgoraSettings(): Promise<AgoraSettingsResponseDto> {
    return this.settingsService.getAgoraSettings();
  }

  @Patch('agora')
  @ApiOperation({ summary: 'Update Agora settings' })
  @ApiResponse({ 
    status: 200, 
    description: 'Agora settings updated successfully',
    type: AgoraSettingsResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid settings data' 
  })
  async updateAgoraSettings(
    @Body() updateDto: UpdateAgoraSettingsDto,
    @CurrentUser() user: User,
  ): Promise<AgoraSettingsResponseDto> {
    // JWT Guard يضع payload في request.user، لذا sub موجود في user object
    const userId = (user as any)?.sub || (user as any)?._id?.toString() || (user as any)?.id?.toString();
    if (!userId) {
      throw new Error('User ID not found. User object: ' + JSON.stringify(user));
    }
    return this.settingsService.updateAgoraSettings(updateDto, userId);
  }

  @Post('agora/test')
  @ApiOperation({ summary: 'Test Agora connection' })
  @ApiResponse({ 
    status: 200, 
    description: 'Agora connection test completed',
    type: TestAgoraConnectionDto
  })
  async testAgoraConnection(): Promise<TestAgoraConnectionDto> {
    return this.settingsService.testAgoraConnection();
  }

  @Get()
  @ApiOperation({ summary: 'Get all system settings' })
  @ApiResponse({ 
    status: 200, 
    description: 'System settings retrieved successfully',
    type: SystemSettingsResponseDto
  })
  async getSystemSettings(): Promise<SystemSettingsResponseDto> {
    return this.settingsService.getSystemSettings();
  }

  @Patch()
  @ApiOperation({ summary: 'Update system settings' })
  @ApiResponse({ 
    status: 200, 
    description: 'System settings updated successfully',
    type: SystemSettingsResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid settings data' 
  })
  async updateSystemSettings(
    @Body() updateDto: UpdateSettingsRequestDto,
    @CurrentUser() user: User,
  ): Promise<SystemSettingsResponseDto> {
    const userId = (user as any)?.sub || (user as any)?._id?.toString() || (user as any)?.id?.toString();
    if (!userId) {
      throw new Error('User ID not found. User object: ' + JSON.stringify(user));
    }
    return this.settingsService.updateSystemSettings(updateDto, userId);
  }
}
