import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { VideoSession, VideoSessionSchema } from './schemas/video-session.schema';
import { ChatSession, ChatSessionSchema } from './schemas/chat-session.schema';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import { Appointment, AppointmentSchema } from '../schedule/schemas/appointment.schema';
import { AgoraService } from './services/agora.service';
import { VideoSessionService } from './services/video-session.service';
import { ChatService } from './services/chat.service';
import { VideoSessionController } from './controllers/video-session.controller';
import { ChatController } from './controllers/chat.controller';
import { SessionGuardsModule } from './guards/guards.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VideoSession.name, schema: VideoSessionSchema },
      { name: ChatSession.name, schema: ChatSessionSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute for chat messages
      },
    ]),
    SessionGuardsModule,
    SettingsModule,
  ],
  controllers: [VideoSessionController, ChatController],
  providers: [AgoraService, VideoSessionService, ChatService],
  exports: [AgoraService, VideoSessionService, ChatService],
})
export class SessionsModule {}
