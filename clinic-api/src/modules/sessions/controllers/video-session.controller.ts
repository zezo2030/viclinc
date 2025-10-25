import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VideoSessionService } from '../services/video-session.service';
import { RequestVideoTokenDto, VideoTokenResponseDto } from '../dto/request-video-token.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../../users/schemas/user.schema';

@ApiTags('Video Sessions')
@ApiBearerAuth()
@Controller('sessions/video')
@UseGuards(JwtAuthGuard)
export class VideoSessionController {
  constructor(private readonly videoSessionService: VideoSessionService) {}

  @Post('token')
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
  ): Promise<VideoTokenResponseDto> {
    return this.videoSessionService.requestVideoToken(requestDto, (user as any)._id.toString());
  }

  @Get(':appointmentId')
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
    return this.videoSessionService.getSessionInfo(appointmentId, (user as any)._id.toString());
  }

  @Post(':appointmentId/end')
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
    await this.videoSessionService.endSession(appointmentId, (user as any)._id.toString());
    return { message: 'Session ended successfully' };
  }

  @Post(':appointmentId/join')
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
    await this.videoSessionService.joinSession(appointmentId, (user as any)._id.toString());
    return { message: 'Joined session successfully' };
  }

  @Post(':appointmentId/leave')
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
    await this.videoSessionService.leaveSession(appointmentId, (user as any)._id.toString());
    return { message: 'Left session successfully' };
  }
}
