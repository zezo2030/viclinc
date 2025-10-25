import { Controller, Get, Post, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ChatService } from '../services/chat.service';
import { SendMessageDto, MessageResponseDto } from '../dto/send-message.dto';
import { ReportChatDto, ReportResponseDto } from '../dto/report-chat.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { User } from '../../users/schemas/user.schema';

@ApiTags('Chat Sessions')
@ApiBearerAuth()
@Controller('sessions/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':appointmentId')
  @ApiOperation({ summary: 'Get chat session information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Chat session information retrieved successfully' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Not authorized to access this chat' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Appointment not found' 
  })
  async getChatSession(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: User,
  ) {
    return this.chatService.getChatSession(appointmentId, (user as any)._id.toString());
  }

  @Get(':appointmentId/messages')
  @ApiOperation({ summary: 'Get chat messages' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Messages per page (default: 50, max: 100)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Messages retrieved successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Chat session has expired' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Not authorized to access this chat' 
  })
  async getMessages(
    @Param('appointmentId') appointmentId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @CurrentUser() user: User,
  ) {
    // تحديد حد أقصى للرسائل في الصفحة الواحدة
    const maxLimit = Math.min(limit, 100);
    const pageNum = Math.max(page, 1);
    
    return this.chatService.getMessages(
      appointmentId, 
      (user as any)._id.toString(), 
      pageNum, 
      maxLimit
    );
  }

  @Post(':appointmentId/messages')
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Send a message (rate limited: 10 messages/minute)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Message sent successfully',
    type: MessageResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Chat session is not active or has expired' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Not authorized to send messages to this chat' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Too many requests - rate limit exceeded' 
  })
  async sendMessage(
    @Param('appointmentId') appointmentId: string,
    @Body() messageDto: SendMessageDto,
    @CurrentUser() user: User,
  ): Promise<MessageResponseDto> {
    return this.chatService.sendMessage(
      appointmentId, 
      (user as any)._id.toString(), 
      messageDto
    );
  }

  @Post(':appointmentId/read')
  @ApiOperation({ summary: 'Mark messages as read' })
  @ApiResponse({ 
    status: 200, 
    description: 'Messages marked as read successfully' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Not authorized to access this chat' 
  })
  async markAsRead(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: User,
  ) {
    await this.chatService.markAsRead(appointmentId, (user as any)._id.toString());
    return { message: 'Messages marked as read' };
  }

  @Get(':appointmentId/unread-count')
  @ApiOperation({ summary: 'Get unread messages count' })
  @ApiResponse({ 
    status: 200, 
    description: 'Unread count retrieved successfully' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Not authorized to access this chat' 
  })
  async getUnreadCount(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: User,
  ) {
    const count = await this.chatService.getUnreadCount(appointmentId, (user as any)._id.toString());
    return { unreadCount: count };
  }

  @Post(':appointmentId/archive')
  @ApiOperation({ summary: 'Archive chat session' })
  @ApiResponse({ 
    status: 200, 
    description: 'Chat archived successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Chat is already archived' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Not authorized to archive this chat' 
  })
  async archiveChat(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: User,
  ) {
    await this.chatService.archiveChat(appointmentId, (user as any)._id.toString());
    return { message: 'Chat archived successfully' };
  }

  @Post(':appointmentId/report')
  @ApiOperation({ summary: 'Report inappropriate chat content' })
  @ApiResponse({ 
    status: 201, 
    description: 'Report submitted successfully',
    type: ReportResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Not authorized to report this chat' 
  })
  async reportChat(
    @Param('appointmentId') appointmentId: string,
    @Body() reportDto: ReportChatDto,
    @CurrentUser() user: User,
  ): Promise<ReportResponseDto> {
    return this.chatService.reportChat(
      appointmentId, 
      (user as any)._id.toString(), 
      reportDto
    );
  }
}
