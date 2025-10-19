import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({
    type: Types.ObjectId,
    ref: 'Chat',
    required: true,
  })
  chat: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  sender: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  content: string;

  @Prop({
    type: String,
    enum: ['text', 'image', 'file', 'video', 'audio'],
    default: 'text',
  })
  messageType: string;

  @Prop([
    {
      url: String,
      type: String,
      name: String,
      size: Number,
    },
  ])
  attachments?: {
    url: string;
    type: string;
    name: string;
    size: number;
  }[];

  @Prop([
    {
      user: { type: Types.ObjectId, ref: 'User' },
      readAt: { type: Date, default: Date.now },
    },
  ])
  readBy?: {
    user: Types.ObjectId;
    readAt: Date;
  }[];

  @Prop({
    type: Types.ObjectId,
    ref: 'Message',
  })
  replyTo?: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes for performance
MessageSchema.index({ chat: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
