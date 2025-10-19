import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CertificationDocument = Certification & Document;

@Schema({ timestamps: true })
export class Certification {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  issuingOrganization: string;

  @Prop({ required: true })
  issueDate: Date;

  @Prop()
  expirationDate?: Date;

  @Prop({ trim: true })
  credentialId?: string;

  @Prop({ trim: true })
  credentialUrl?: string;

  @Prop({ maxlength: 500 })
  description?: string;

  @Prop([String])
  skills?: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
}

export const CertificationSchema = SchemaFactory.createForClass(Certification);
