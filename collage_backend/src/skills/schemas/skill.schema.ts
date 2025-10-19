import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SkillDocument = Skill & Document;

@Schema({ timestamps: true })
export class Skill {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner',
  })
  level: string;

  @Prop({
    required: true,
    enum: [
      'Programming',
      'Framework',
      'Database',
      'Tool',
      'Language',
      'Soft Skill',
      'Other',
    ],
    default: 'Other',
  })
  category: string;

  @Prop({ default: 0, min: 0, max: 50 })
  yearsOfExperience: number;

  @Prop({ maxlength: 500 })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);

// Add compound index to prevent duplicate skills for the same user
SkillSchema.index({ name: 1, userId: 1 }, { unique: true });
