import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({
    type: String,
    enum: ['one-to-one', 'group'],
    required: true,
    default: 'one-to-one',
  })
  type: string;

  @Prop({
    type: String,
    required: function () {
      return this.type === 'group';
    },
  })
  name?: string;

  @Prop({ type: String })
  description?: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
    required: true,
  })
  participants: Types.ObjectId[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
  })
  admins?: Types.ObjectId[];

  @Prop({
    type: Types.ObjectId,
    ref: 'Message',
  })
  lastMessage?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  createdBy: Types.ObjectId;

  @Prop({ type: String })
  avatar?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

// Indexes for performance
ChatSchema.index({ participants: 1 });
ChatSchema.index({ type: 1 });
ChatSchema.index({ updatedAt: -1 });
