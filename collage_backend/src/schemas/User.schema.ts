import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AuthProvider } from '../dto/auth.dto';
import { Document } from 'mongoose';

// Make sure User extends Document to get the full Mongoose document functionality
@Schema({ timestamps: true }) // Automatically adds `createdAt` and `updatedAt`
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop()
  pic: string;

  @Prop()
  profileImage?: string;

  @Prop()
  password: string;

  @Prop({ required: true, enum: AuthProvider })
  provider: AuthProvider;

  @Prop()
  facebookId?: string; // Make this optional for OAuth users

  @Prop()
  googleId?: string; // Make this optional for OAuth users

  @Prop({ maxlength: 50 })
  firstName?: string;

  @Prop({ maxlength: 50 })
  lastName?: string;

  // Computed field for full name
  fullName?: string;

  @Prop({ default: Date.now }) // Set default to current date
  createdAt: Date;

  @Prop({ default: Date.now }) // Set default to current date
  updatedAt: Date;

  @Prop({ required: true, minlength: 3, maxlength: 30, unique: true })
  userName: string;

  // OTP Authentication fields
  @Prop()
  otp?: number;

  @Prop()
  otpExpiry?: Date;

  @Prop()
  verificationLink?: string;

  @Prop()
  linkExpiry?: Date;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: false })
  isAccountConfirmed: boolean;

  // Password indication fields
  @Prop({ default: false })
  hasPassword: boolean;

  // Additional profile fields
  @Prop({ match: /^\+?[1-9]\d{1,14}$/ })
  phone?: string;

  @Prop({ maxlength: 500 })
  bio?: string;

  @Prop({ maxlength: 100 })
  location?: string;

  @Prop({ match: /^https?:\/\/.+\..+$/ })
  website?: string;

  @Prop({ default: ['user'] })
  roles: string[];

  // Security fields
  @Prop({ default: 0 })
  failedLoginAttempts: number;

  @Prop()
  lastFailedLogin?: Date;

  @Prop()
  accountLockedUntil?: Date;

  @Prop({ default: false })
  isAccountLocked: boolean;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpiry?: Date;

  @Prop()
  refreshToken?: string;

  @Prop()
  refreshTokenExpiry?: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  lastLoginIP?: string;

  @Prop({ default: true })
  isActive: boolean;

  // Two-factor authentication
  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @Prop()
  twoFactorSecret?: string;

  @Prop()
  twoFactorBackupCodes?: string[];
}

// Create and export the schema
export const UserSchema = SchemaFactory.createForClass(User);
