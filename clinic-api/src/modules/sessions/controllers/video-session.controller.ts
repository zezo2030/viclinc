import { Controller, Post, Get, Body, Param, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VideoSessionService } from '../services/video-session.service';
import { AgoraService } from '../services/agora.service';
import { RequestVideoTokenDto, VideoTokenResponseDto } from '../dto/request-video-token.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../../users/schemas/user.schema';

@ApiTags('Video Sessions')
@Controller('sessions/video')
export class VideoSessionController {
  constructor(
    private readonly videoSessionService: VideoSessionService,
    private readonly agoraService: AgoraService,
  ) {}

  @Get('app-id')
  @ApiOperation({ summary: 'Get Agora App ID (public endpoint)' })
  @ApiResponse({ 
    status: 200, 
    description: 'App ID retrieved successfully' 
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Agora service is not configured' 
  })
  async getAppId() {
    return this.agoraService.getAppId();
  }

  @Post('token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request video session token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Video token generated successfully',
    type: VideoTokenResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid request or session not available yet' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Not authorized to access this appointment' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Appointment not found' 
  })
  async requestVideoToken(
    @Body() requestDto: RequestVideoTokenDto,
    @CurrentUser() user: User,
    @Headers('x-test-mode') testModeHeader?: string,
  ): Promise<VideoTokenResponseDto> {
    // JWT Guard يضع payload في request.user، لذا sub موجود في user object
    const userId = (user as any)?.sub || (user as any)?._id?.toString() || (user as any)?.id?.toString();
    if (!userId) {
      throw new Error('User ID not found');
    }
    const normalizedHeader = (testModeHeader ?? '').toString().trim().toLowerCase();
    const isTestMode = ['true', '1', 'yes', 'y'].includes(normalizedHeader);
    return this.videoSessionService.requestVideoToken(requestDto, userId, { isTestMode });
  }

  @Get(':appointmentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get video session information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Session information retrieved successfully' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Not authorized to access this session' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Session not found' 
  })
  async getSessionInfo(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: User,
  ) {
    const userId = (user as any)?.sub || (user as any)?._id?.toString() || (user as any)?.id?.toString();
    if (!userId) {
      throw new Error('User ID not found');
    }
    return this.videoSessionService.getSessionInfo(appointmentId, userId);
  }

  @Post(':appointmentId/end')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'End video session (doctor only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Session ended successfully' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Only doctor can end the session' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Session not found' 
  })
  async endSession(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: User,
  ) {
    const userId = (user as any)?.sub || (user as any)?._id?.toString() || (user as any)?.id?.toString();
    if (!userId) {
      throw new Error('User ID not found');
    }
    await this.videoSessionService.endSession(appointmentId, userId);
    return { message: 'Session ended successfully' };
  }

  @Post(':appointmentId/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join video session' })
  @ApiResponse({ 
    status: 200, 
    description: 'Joined session successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Session not found' 
  })
  async joinSession(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: User,
  ) {
    const userId = (user as any)?.sub || (user as any)?._id?.toString() || (user as any)?.id?.toString();
    if (!userId) {
      throw new Error('User ID not found');
    }
    await this.videoSessionService.joinSession(appointmentId, userId);
    return { message: 'Joined session successfully' };
  }

  @Post(':appointmentId/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave video session' })
  @ApiResponse({ 
    status: 200, 
    description: 'Left session successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Session not found' 
  })
  async leaveSession(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: User,
  ) {
    const userId = (user as any)?.sub || (user as any)?._id?.toString() || (user as any)?.id?.toString();
    if (!userId) {
      throw new Error('User ID not found');
    }
    await this.videoSessionService.leaveSession(appointmentId, userId);
    return { message: 'Left session successfully' };
  }
}
