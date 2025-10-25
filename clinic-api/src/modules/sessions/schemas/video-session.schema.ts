import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type VideoSessionDocument = VideoSession & Document;

export enum VideoSessionStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  ENDED = 'ended',
}

export enum ParticipantRole {
  DOCTOR = 'doctor',
  PATIENT = 'patient',
}

@Schema({ _id: false })
export class Participant {
  @ApiProperty({ description: 'User ID', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Participant role', enum: ParticipantRole, example: ParticipantRole.DOCTOR })
  @Prop({ required: true, enum: ParticipantRole })
  role: ParticipantRole;

  @ApiProperty({ description: 'Join timestamp', example: '2024-01-15T10:00:00.000Z', required: false })
  @Prop()
  joinedAt?: Date;

  @ApiProperty({ description: 'Leave timestamp', example: '2024-01-15T10:30:00.000Z', required: false })
  @Prop()
  leftAt?: Date;
}

@Schema({ _id: false })
export class SessionMetadata {
  @ApiProperty({ description: 'Session duration in minutes', example: 30, required: false })
  @Prop()
  duration?: number;

  @ApiProperty({ description: 'Video quality', example: 'HD', required: false })
  @Prop()
  quality?: string;

  @ApiProperty({ description: 'Network conditions', example: { bandwidth: 'high', latency: 'low' }, required: false })
  @Prop({ type: Object })
  networkConditions?: Record<string, any>;
}

@Schema({ timestamps: true, collection: 'video_sessions' })
export class VideoSession {
  @ApiProperty({ description: 'Appointment ID', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @Prop({ required: true, unique: true, type: Types.ObjectId, ref: 'Appointment' })
  appointmentId: Types.ObjectId;

  @ApiProperty({ description: 'Agora channel name', example: 'appointment-123' })
  @Prop({ required: true })
  channelName: string;

  @ApiProperty({ description: 'Session status', enum: VideoSessionStatus, example: VideoSessionStatus.WAITING })
  @Prop({ required: true, enum: VideoSessionStatus, default: VideoSessionStatus.WAITING })
  status: VideoSessionStatus;

  @ApiProperty({ description: 'Session start timestamp', example: '2024-01-15T10:00:00.000Z', required: false })
  @Prop()
  startedAt?: Date;

  @ApiProperty({ description: 'Session end timestamp', example: '2024-01-15T10:30:00.000Z', required: false })
  @Prop()
  endedAt?: Date;

  @ApiProperty({ description: 'Session participants', type: [Participant] })
  @Prop({ type: [Participant], default: [] })
  participants: Participant[];

  @ApiProperty({ description: 'Session metadata', type: SessionMetadata, required: false })
  @Prop({ type: SessionMetadata })
  metadata?: SessionMetadata;

  @ApiProperty({ description: 'Additional session data', example: { notes: 'Patient prefers morning' }, required: false })
  @Prop({ type: Object })
  data?: Record<string, any>;
}

export const VideoSessionSchema = SchemaFactory.createForClass(VideoSession);

// فهرس فريد على appointmentId
VideoSessionSchema.index({ appointmentId: 1 }, { unique: true });

// فهارس للاستعلامات
VideoSessionSchema.index({ status: 1, startedAt: 1 });
VideoSessionSchema.index({ channelName: 1 });
VideoSessionSchema.index({ 'participants.userId': 1 });
VideoSessionSchema.index({ createdAt: 1 });
