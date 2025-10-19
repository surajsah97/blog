import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  IsNumber,
  IsBoolean,
  IsPhoneNumber,
  Matches,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AuthProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  LOCAL = 'local', // For normal sign-in
  OTP = 'otp', // For OTP-based authentication
}

export enum SignupMethod {
  PASSWORD = 'password',
  OTP = 'otp',
  SOCIAL = 'social',
}

export enum LoginMethod {
  PASSWORD = 'password',
  OTP = 'otp',
  SOCIAL = 'social',
}

export class AuthDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiPropertyOptional({
    description:
      'User password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password?: string;

  @ApiProperty({
    description: 'Authentication provider',
    enum: AuthProvider,
    example: AuthProvider.LOCAL,
  })
  @IsEnum(AuthProvider, {
    message: 'Provider must be local, google, facebook, or otp',
  })
  @IsNotEmpty({ message: 'Provider is required' })
  provider: AuthProvider;

  // For Google Authentication
  @ApiPropertyOptional({
    description: 'Google OAuth ID',
    example: '123456789012345678901',
  })
  @IsOptional()
  @IsString({ message: 'Google ID must be a string' })
  googleId?: string;

  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString({ message: 'Display name must be a string' })
  displayName?: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://example.com/profile.jpg',
    format: 'uri',
  })
  @IsOptional()
  @IsString({ message: 'Profile picture URL must be a string' })
  @Matches(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i, {
    message: 'Profile picture must be a valid image URL',
  })
  pic?: string;

  // For Facebook Authentication
  @ApiPropertyOptional({
    description: 'Facebook OAuth ID',
    example: '123456789012345678901',
  })
  @IsOptional()
  @IsString({ message: 'Facebook ID must be a string' })
  facebookId?: string;

  // For OTP Authentication
  @ApiPropertyOptional({
    description: 'One-Time Password (6 digits)',
    example: 123456,
    minimum: 100000,
    maximum: 999999,
  })
  @IsOptional()
  @IsNumber({}, { message: 'OTP must be a number' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp?: number;

  @ApiPropertyOptional({
    description:
      'Unique username (3-30 chars, alphanumeric, underscore, hyphen)',
    example: 'johndoe123',
    minLength: 3,
    maxLength: 30,
  })
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  @Length(3, 30, { message: 'Username must be between 3 and 30 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Username can only contain letters, numbers, underscores, and hyphens',
  })
  userName?: string;

  @ApiPropertyOptional({
    description: 'Phone number (international format)',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Please provide a valid phone number',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'User biography',
    example: 'Software developer passionate about web technologies',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  @Length(0, 500, { message: 'Bio must not exceed 500 characters' })
  bio?: string;

  @ApiPropertyOptional({
    description: 'User location',
    example: 'San Francisco, CA',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  @Length(0, 100, { message: 'Location must not exceed 100 characters' })
  location?: string;

  @ApiPropertyOptional({
    description: 'User website URL',
    example: 'https://johndoe.com',
    format: 'uri',
  })
  @IsOptional()
  @IsString({ message: 'Website must be a string' })
  @Matches(/^https?:\/\/.+\..+$/, { message: 'Website must be a valid URL' })
  website?: string;
}

export class SignupDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiPropertyOptional({
    description:
      'User password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password?: string;

  @ApiProperty({
    description: 'Signup method',
    enum: SignupMethod,
    example: SignupMethod.PASSWORD,
  })
  @IsEnum(SignupMethod, {
    message: 'Signup method must be password, otp, or social',
  })
  @IsNotEmpty({ message: 'Signup method is required' })
  signupMethod: SignupMethod;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  lastName?: string;

  @ApiPropertyOptional({
    description:
      'Unique username (3-30 chars, alphanumeric, underscore, hyphen)',
    example: 'johndoe123',
    minLength: 3,
    maxLength: 30,
  })
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  @Length(3, 30, { message: 'Username must be between 3 and 30 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Username can only contain letters, numbers, underscores, and hyphens',
  })
  userName?: string;

  @ApiPropertyOptional({
    description: 'Phone number (international format)',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Please provide a valid phone number',
  })
  phone?: string;

  // For social signup
  @ApiPropertyOptional({
    description: 'Google OAuth ID',
    example: '123456789012345678901',
  })
  @IsOptional()
  @IsString({ message: 'Google ID must be a string' })
  googleId?: string;

  @ApiPropertyOptional({
    description: 'Facebook OAuth ID',
    example: '123456789012345678901',
  })
  @IsOptional()
  @IsString({ message: 'Facebook ID must be a string' })
  facebookId?: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://example.com/profile.jpg',
    format: 'uri',
  })
  @IsOptional()
  @IsString({ message: 'Profile picture URL must be a string' })
  @Matches(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i, {
    message: 'Profile picture must be a valid image URL',
  })
  pic?: string;
}

export class OtpVerificationDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'One-Time Password (6 digits)',
    example: 123456,
    minimum: 100000,
    maximum: 999999,
  })
  @IsNumber({}, { message: 'OTP must be a number' })
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: number;
}

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiPropertyOptional({
    description: 'User password (required for password login)',
    example: 'SecurePass123!',
  })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  password?: string;

  @ApiPropertyOptional({
    description: 'One-Time Password (6 digits, required for OTP login)',
    example: 123456,
    minimum: 100000,
    maximum: 999999,
  })
  @IsOptional()
  @IsNumber({}, { message: 'OTP must be a number' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp?: number;

  @ApiProperty({
    description: 'Login method',
    enum: LoginMethod,
    example: LoginMethod.PASSWORD,
  })
  @IsEnum(LoginMethod, {
    message: 'Login method must be password, otp, or social',
  })
  @IsNotEmpty({ message: 'Login method is required' })
  loginMethod: LoginMethod;
}

export class PasswordResetDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;
}

export class PasswordResetConfirmDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'Password reset token received via email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'Reset token must be a string' })
  @IsNotEmpty({ message: 'Reset token is required' })
  resetToken: string;

  @ApiProperty({
    description:
      'New password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
    example: 'NewSecurePass123!',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'CurrentPass123!',
  })
  @IsString({ message: 'Current password must be a string' })
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @ApiProperty({
    description:
      'New password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
    example: 'NewSecurePass123!',
    minLength: 8,
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token for getting new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}
