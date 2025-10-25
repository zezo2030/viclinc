import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateAgoraSettingsDto, AgoraSettingsResponseDto, TestAgoraConnectionDto } from './dto/update-agora-settings.dto';
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
    return this.settingsService.updateAgoraSettings(updateDto, (user as any)._id.toString());
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
}
