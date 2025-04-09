import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';

export enum AuthProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  LOCAL = 'local',  // For normal sign-in
}

export class AuthDto {
  @IsEmail()  // Ensures the email is in a valid email format
  @IsNotEmpty()  // Ensures email is not empty
  email: string;

  @IsOptional()  // Optional for OAuth login, required for local authentication
  @IsString()  // Ensures password is a string
  @MinLength(6, { message: 'Password must be at least 6 characters long' })  // Password validation (for local)
  password?: string;

  @IsEnum(AuthProvider)  // Specifies that provider is either 'local', 'google', or 'facebook'
  @IsNotEmpty()
  provider: AuthProvider;

  // For Google Authentication
  @IsOptional()  // Optional for Google sign-in
  @IsString()
  googleId?: string;

  @IsOptional()  // Optional for Google sign-in
  @IsString()
  displayName?: string;

  @IsOptional()  // Optional for Google sign-in
  @IsString()
  firstName?: string;

  @IsOptional()  // Optional for Google sign-in
  @IsString()
  lastName?: string;

  @IsOptional()  // Optional for Google sign-in
  @IsString()
  pic?: string;

  // For Facebook Authentication
  @IsOptional()  // Optional for Facebook sign-in
  @IsString()
  facebookId?: string;
}
