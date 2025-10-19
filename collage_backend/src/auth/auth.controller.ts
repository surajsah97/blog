import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/dto/createUser.dto';
import { AuthService } from './auth.service';
import { LocalGuard } from './utils/guards/local.guards';
import { GoogleAuthGuard } from './utils/guards/google.guards';
import { Request, Response } from 'express'; // Added Response import
import { AuthGuard } from '@nestjs/passport';
import { FacebookAuthGuard } from './utils/guards/facebook.guard';
import {
  AuthDto,
  SignupDto,
  OtpVerificationDto,
  LoginDto,
  SignupMethod,
  AuthProvider,
  PasswordResetDto,
  PasswordResetConfirmDto,
  ChangePasswordDto,
  RefreshTokenDto,
} from 'src/dto/auth.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ============ SIGNUP ENDPOINTS ============

  /**
   * Signup with password
   */
  @Post('signup/password')
  @ApiOperation({
    summary: 'Signup with password',
    description:
      'Create a new user account with email and password. User will receive a confirmation email.',
  })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully. Confirmation email sent.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example:
            'User created successfully. Please check your email for confirmation.',
        },
        user: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', example: 'user@example.com' },
            userName: { type: 'string', example: 'johndoe123' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            provider: { type: 'string', example: 'local' },
            hasPassword: { type: 'boolean', example: true },
            isAccountConfirmed: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async signupWithPassword(@Body() signupData: SignupDto) {
    try {
      const result = await this.authService.signupWithPassword(signupData);
      return result;
    } catch (error) {
      console.error('Password signup error:', error);
      if (error.code === 11000) {
        // MongoDB duplicate key error
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }
      throw new HttpException(
        error.message || 'Password signup failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Signup with OTP
   */
  @Post('signup/otp')
  @ApiOperation({
    summary: 'Signup with OTP',
    description:
      'Create a new user account with email only. User will receive an OTP via email for verification.',
  })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully. OTP sent to email.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User created successfully. OTP sent to your email.',
        },
        user: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', example: 'user@example.com' },
            userName: { type: 'string', example: 'johndoe123' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            provider: { type: 'string', example: 'otp' },
            hasPassword: { type: 'boolean', example: false },
            isAccountConfirmed: { type: 'boolean', example: false },
          },
        },
        otpExpiry: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async signupWithOtp(@Body() signupData: SignupDto) {
    try {
      const result = await this.authService.signupWithOtp(signupData);
      return result;
    } catch (error) {
      console.error('OTP signup error:', error);
      if (error.code === 11000) {
        // MongoDB duplicate key error
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }
      throw new HttpException(
        error.message || 'OTP signup failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify OTP for signup
   */
  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verify OTP for signup',
    description:
      'Verify the OTP received via email to confirm the user account.',
  })
  @ApiBody({ type: OtpVerificationDto })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully. Account confirmed.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'OTP verified successfully. Account confirmed.',
        },
        user: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', example: 'user@example.com' },
            userName: { type: 'string', example: 'johndoe123' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            provider: { type: 'string', example: 'otp' },
            hasPassword: { type: 'boolean', example: false },
            isAccountConfirmed: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid OTP or OTP expired' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async verifyOtpForSignup(@Body() otpData: OtpVerificationDto) {
    try {
      const result = await this.authService.verifyOtpForSignup(otpData);
      return result;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw new HttpException(
        error.message || 'OTP verification failed',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Resend OTP for signup
   */
  @Post('resend-otp')
  @ApiOperation({
    summary: 'Resend OTP for signup',
    description: 'Resend OTP to user email for account verification.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OTP resent successfully.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'OTP resent successfully.' },
        otpExpiry: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'User already confirmed or invalid email',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async resendOtpForSignup(@Body() body: { email: string }) {
    try {
      const result = await this.authService.resendOtpForSignup(body.email);
      return result;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw new HttpException(
        error.message || 'Failed to resend OTP',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ============ LOGIN ENDPOINTS ============

  /**
   * Login with password
   */
  @Post('login/password')
  @ApiOperation({
    summary: 'Login with password',
    description:
      'Authenticate user with email and password. Returns access token and refresh token.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Login successful' },
        user: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', example: 'user@example.com' },
            userName: { type: 'string', example: 'johndoe123' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            pic: { type: 'string', example: 'https://example.com/profile.jpg' },
            provider: { type: 'string', example: 'local' },
            hasPassword: { type: 'boolean', example: true },
            isAccountConfirmed: { type: 'boolean', example: true },
            lastLoginAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T12:00:00.000Z',
            },
          },
        },
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials or account not confirmed',
  })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 429,
    description: 'Account locked due to too many failed attempts',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async loginWithPassword(@Body() loginData: LoginDto, @Req() req: Request) {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const result = await this.authService.loginWithPassword(loginData, ip);
      return result;
    } catch (error) {
      console.error('Password login error:', error);
      throw new HttpException(
        error.message || 'Login failed',
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Send OTP for login
   */
  @Post('login/send-otp')
  @ApiOperation({
    summary: 'Send OTP for login',
    description: 'Send OTP to user email for passwordless login.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'OTP sent successfully.' },
        otpExpiry: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'User has password set or account not confirmed',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendOtpForLogin(@Body() body: { email: string }) {
    try {
      const result = await this.authService.sendOtpForLogin(body.email);
      return result;
    } catch (error) {
      console.error('Send OTP for login error:', error);
      throw new HttpException(
        error.message || 'Failed to send OTP',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Login with OTP
   */
  @Post('login/otp')
  @ApiOperation({
    summary: 'Login with OTP',
    description:
      'Authenticate user with email and OTP. Returns access token and refresh token.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Login successful' },
        user: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', example: 'user@example.com' },
            userName: { type: 'string', example: 'johndoe123' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            pic: { type: 'string', example: 'https://example.com/profile.jpg' },
            provider: { type: 'string', example: 'otp' },
            hasPassword: { type: 'boolean', example: false },
            isAccountConfirmed: { type: 'boolean', example: true },
            lastLoginAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T12:00:00.000Z',
            },
          },
        },
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid OTP or OTP expired' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async loginWithOtp(@Body() loginData: LoginDto, @Req() req: Request) {
    try {
      const result = await this.authService.loginWithOtp(loginData);
      return result;
    } catch (error) {
      console.error('OTP login error:', error);
      throw new HttpException(
        error.message || 'OTP login failed',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ============ PASSWORD MANAGEMENT ============

  /**
   * Request password reset
   */
  @Post('password/reset')
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send password reset link to user email.',
  })
  @ApiBody({ type: PasswordResetDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password reset email sent successfully.',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async requestPasswordReset(@Body() resetData: PasswordResetDto) {
    try {
      const result = await this.authService.requestPasswordReset(resetData);
      return result;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw new HttpException(
        error.message || 'Failed to request password reset',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Confirm password reset
   */
  @Post('password/reset/confirm')
  @ApiOperation({
    summary: 'Confirm password reset',
    description: 'Reset user password using the token received via email.',
  })
  @ApiBody({ type: PasswordResetConfirmDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password reset successfully.' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid token or token expired' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async confirmPasswordReset(@Body() resetData: PasswordResetConfirmDto) {
    try {
      const result = await this.authService.confirmPasswordReset(resetData);
      return result;
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      throw new HttpException(
        error.message || 'Failed to confirm password reset',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Change password
   */
  @Post('password/change')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Change password',
    description: 'Change user password (requires authentication).',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password changed successfully.' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async changePassword(@Body() changeData: ChangePasswordDto, @Req() req: any) {
    try {
      const userId = req.user.sub;
      const result = await this.authService.changePassword(userId, changeData);
      return result;
    } catch (error) {
      console.error('Change password error:', error);
      throw new HttpException(
        error.message || 'Failed to change password',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ============ TOKEN MANAGEMENT ============

  /**
   * Refresh access token
   */
  @Post('token/refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get new access token using refresh token.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully.',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async refreshAccessToken(@Body() refreshData: RefreshTokenDto) {
    try {
      const result = await this.authService.refreshAccessToken(refreshData);
      return result;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new HttpException(
        error.message || 'Failed to refresh token',
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Revoke refresh token
   */
  @Post('token/revoke')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Revoke refresh token',
    description: 'Revoke user refresh token (logout).',
  })
  @ApiResponse({
    status: 200,
    description: 'Token revoked successfully.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Token revoked successfully' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async revokeRefreshToken(@Req() req: any) {
    try {
      const userId = req.user.sub;
      await this.authService.revokeRefreshToken(userId);
      return { message: 'Token revoked successfully' };
    } catch (error) {
      console.error('Token revocation error:', error);
      throw new HttpException(
        error.message || 'Failed to revoke token',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============ SOCIAL AUTHENTICATION ============

  /**
   * Google OAuth
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth',
    description: 'Initiate Google OAuth authentication flow.',
  })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
  async googleAuth() {
    // This endpoint is handled by GoogleAuthGuard
  }

  /**
   * Google OAuth callback
   */
  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Handle Google OAuth callback and create/login user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Google authentication successful.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Google authentication successful',
        },
        user: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', example: 'user@gmail.com' },
            userName: { type: 'string', example: 'johndoe123' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            pic: {
              type: 'string',
              example: 'https://lh3.googleusercontent.com/...',
            },
            provider: { type: 'string', example: 'google' },
            hasPassword: { type: 'boolean', example: false },
            isAccountConfirmed: { type: 'boolean', example: true },
          },
        },
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req.user);
      return res.redirect(
        `${process.env.CLIENT_URL || 'http://localhost:4200'}/auth/social-auth-callback?token=${result.accessToken}&refreshToken=${result.refreshToken}`,
      );
    } catch (error) {
      console.error('Google auth redirect error:', error);
      return res.redirect(
        `${process.env.CLIENT_URL || 'http://localhost:4200'}/auth/social-auth-callback?error=${encodeURIComponent(error.message)}`,
      );
    }
  }

  /**
   * Facebook OAuth
   */
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({
    summary: 'Facebook OAuth',
    description: 'Initiate Facebook OAuth authentication flow.',
  })
  @ApiResponse({ status: 302, description: 'Redirect to Facebook OAuth' })
  async facebookAuth() {
    // This endpoint is handled by FacebookAuthGuard
  }

  /**
   * Facebook OAuth callback
   */
  @Get('facebook/redirect')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({
    summary: 'Facebook OAuth callback',
    description: 'Handle Facebook OAuth callback and create/login user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Facebook authentication successful.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Facebook authentication successful',
        },
        user: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', example: 'user@facebook.com' },
            userName: { type: 'string', example: 'johndoe123' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            pic: { type: 'string', example: 'https://graph.facebook.com/...' },
            provider: { type: 'string', example: 'facebook' },
            hasPassword: { type: 'boolean', example: false },
            isAccountConfirmed: { type: 'boolean', example: true },
          },
        },
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async facebookAuthRedirect(@Req() req: any, @Res() res: Response) {
    try {
      const result = await this.authService.facebookLogin(req.user);
      return res.redirect(
        `${process.env.CLIENT_URL || 'http://localhost:4200'}/auth/social-auth-callback?token=${result.accessToken}&refreshToken=${result.refreshToken}`,
      );
    } catch (error) {
      console.error('Facebook auth redirect error:', error);
      return res.redirect(
        `${process.env.CLIENT_URL || 'http://localhost:4200'}/auth/social-auth-callback?error=${encodeURIComponent(error.message)}`,
      );
    }
  }
}
