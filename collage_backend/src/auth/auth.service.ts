import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AuthDto,
  AuthProvider,
  SignupDto,
  SignupMethod,
  OtpVerificationDto,
  LoginDto,
  PasswordResetDto,
  PasswordResetConfirmDto,
  ChangePasswordDto,
  RefreshTokenDto,
} from '../dto/auth.dto';
import { CreateUserDto } from '../dto/createUser.dto';
import { User } from '../schemas/User.schema';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  // ============ SIGNUP METHODS ============

  /**
   * Signup with password
   */
  async signupWithPassword(signupData: SignupDto) {
    const { email, password, firstName, lastName, userName, phone } =
      signupData;

    // Check if user already exists
    const existingUser = await this.UserModel.findOne({ email });
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    // Validate password is provided
    if (!password) {
      throw new HttpException(
        'Password is required for password signup',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create new user with password
    const user = new this.UserModel({
      email,
      password: await this.hashPassword(password),
      userName: userName || email.split('@')[0],
      provider: AuthProvider.LOCAL,
      firstName,
      lastName,
      phone,
      isEmailVerified: false,
      isAccountConfirmed: false,
      hasPassword: true,
      roles: ['user'],
    });

    await user.save();

    // Generate verification token
    const verificationToken = this.generateToken(user, AuthProvider.LOCAL);

    return {
      message: 'User registered successfully. Please verify your email.',
      user: {
        _id: user._id,
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        hasPassword: user.hasPassword,
        isAccountConfirmed: user.isAccountConfirmed,
      },
      token: verificationToken,
    };
  }

  /**
   * Signup with OTP
   */
  async signupWithOtp(signupData: SignupDto) {
    const { email, firstName, lastName, userName, phone } = signupData;

    // Check if user already exists
    const existingUser = await this.UserModel.findOne({ email });
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create temporary user
    const user = new this.UserModel({
      email,
      userName: userName || email.split('@')[0],
      provider: AuthProvider.OTP,
      firstName,
      lastName,
      phone,
      otp,
      otpExpiry,
      isEmailVerified: false,
      isAccountConfirmed: false,
      hasPassword: false,
      roles: ['user'],
    });

    await user.save();

    // Send OTP email
    await this.sendOtpEmail(email, otp, 'signup');

    // Generate verification token
    const verificationToken = this.generateToken(user, AuthProvider.OTP);

    return {
      message:
        'OTP sent to your email. Please verify to complete registration.',
      user: {
        _id: user._id,
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        hasPassword: user.hasPassword,
        isAccountConfirmed: user.isAccountConfirmed,
      },
      token: verificationToken,
      otpExpiry: otpExpiry,
    };
  }

  /**
   * Signup with social media (Google/Facebook)
   */
  async signupWithSocial(signupData: SignupDto) {
    const { email, googleId, facebookId, firstName, lastName, userName, pic } =
      signupData;

    // Check if user already exists
    const existingUser = await this.UserModel.findOne({ email });
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const provider = googleId ? AuthProvider.GOOGLE : AuthProvider.FACEBOOK;

    // Create new user
    const user = new this.UserModel({
      email,
      userName: userName || email.split('@')[0],
      provider,
      firstName,
      lastName,
      pic,
      googleId: googleId || null,
      facebookId: facebookId || null,
      isEmailVerified: true, // Social accounts are pre-verified
      isAccountConfirmed: true,
      hasPassword: false,
      roles: ['user'],
    });

    await user.save();

    // Generate token
    const token = this.generateToken(user, provider);

    return {
      message: 'Social account registered successfully',
      user: {
        _id: user._id,
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        pic: user.pic,
        provider: user.provider,
        hasPassword: user.hasPassword,
        isAccountConfirmed: user.isAccountConfirmed,
      },
      token,
    };
  }

  /**
   * Verify OTP for signup
   */
  async verifyOtpForSignup(otpData: OtpVerificationDto) {
    const { email, otp } = otpData;

    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Check OTP expiry
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      throw new HttpException(
        'OTP expired. Please request a new OTP.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verify OTP
    if (user.otp !== otp) {
      throw new HttpException(
        'Invalid OTP. Please check your email and try again.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update user status
    user.isEmailVerified = true;
    user.isAccountConfirmed = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate token
    const token = this.generateToken(user, user.provider);

    return {
      message: 'OTP verified successfully. Account confirmed.',
      user: {
        _id: user._id,
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        hasPassword: user.hasPassword,
        isAccountConfirmed: user.isAccountConfirmed,
      },
      token,
    };
  }

  /**
   * Resend OTP for signup
   */
  async resendOtpForSignup(email: string) {
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Check if user is already confirmed
    if (user.isAccountConfirmed) {
      throw new HttpException(
        'Account is already confirmed',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await this.sendOtpEmail(email, otp, 'signup');

    return {
      message: 'New OTP sent to your email',
      otpExpiry: otpExpiry,
    };
  }

  // ============ LOGIN METHODS ============

  /**
   * Login with password
   */
  async loginWithPassword(loginData: LoginDto, ip?: string) {
    const { email, password } = loginData;

    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Check if account is locked
    if (
      user.isAccountLocked &&
      user.accountLockedUntil &&
      new Date() < user.accountLockedUntil
    ) {
      const remainingTime = Math.ceil(
        (user.accountLockedUntil.getTime() - new Date().getTime()) / 60000,
      );
      throw new HttpException(
        `Account is temporarily locked due to too many failed attempts. Please try again in ${remainingTime} minutes.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Check if user has password
    if (!user.hasPassword || !user.password) {
      throw new HttpException(
        'This account was registered without password. Please use OTP or social login.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if account is confirmed
    if (!user.isAccountConfirmed) {
      throw new HttpException(
        'Account not confirmed. Please verify your email first.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw new HttpException(
        'Account is deactivated. Please contact support.',
        HttpStatus.FORBIDDEN,
      );
    }

    // Validate password is provided
    if (!password) {
      throw new HttpException(
        'Password is required for password login',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verify password
    const isPasswordValid = await this.comparePasswords(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;
      user.lastFailedLogin = new Date();

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.isAccountLocked = true;
        user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }

      await user.save();

      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.isAccountLocked = false;
    user.accountLockedUntil = undefined;
    user.lastLoginAt = new Date();
    user.lastLoginIP = ip;
    await user.save();

    // Generate tokens
    const accessToken = this.generateAccessToken(user, AuthProvider.LOCAL);
    const refreshToken = this.generateRefreshToken(user);

    return {
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        pic: user.pic,
        provider: user.provider,
        hasPassword: user.hasPassword,
        isAccountConfirmed: user.isAccountConfirmed,
        lastLoginAt: user.lastLoginAt,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login with OTP
   */
  async loginWithOtp(loginData: LoginDto) {
    const { email, otp } = loginData;

    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Check if account is confirmed
    if (!user.isAccountConfirmed) {
      throw new HttpException(
        'Account not confirmed. Please verify your email first.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check OTP expiry
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      throw new HttpException('OTP expired', HttpStatus.BAD_REQUEST);
    }

    // Verify OTP
    if (user.otp !== otp) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }

    // Clear OTP after successful login
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate token
    const token = this.generateToken(user, AuthProvider.OTP);

    return {
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        pic: user.pic,
        provider: user.provider,
        hasPassword: user.hasPassword,
        isAccountConfirmed: user.isAccountConfirmed,
      },
      token,
    };
  }

  /**
   * Send OTP for login
   */
  async sendOtpForLogin(email: string) {
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Check if account is confirmed
    if (!user.isAccountConfirmed) {
      throw new HttpException(
        'Account not confirmed. Please verify your email first.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await this.sendOtpEmail(email, otp, 'login');

    return {
      message: 'OTP sent to your email for login',
      otpExpiry: otpExpiry,
    };
  }

  /**
   * Login with social media (Google/Facebook)
   */
  async loginWithSocial(socialData: any) {
    const { email, googleId, facebookId } = socialData;

    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new HttpException(
        'User not found. Please signup first.',
        HttpStatus.NOT_FOUND,
      );
    }

    // Verify social ID
    if (googleId && user.googleId !== googleId) {
      throw new HttpException('Invalid Google ID', HttpStatus.UNAUTHORIZED);
    }
    if (facebookId && user.facebookId !== facebookId) {
      throw new HttpException('Invalid Facebook ID', HttpStatus.UNAUTHORIZED);
    }

    // Check if account is confirmed
    if (!user.isAccountConfirmed) {
      throw new HttpException(
        'Account not confirmed. Please verify your email first.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const provider = googleId ? AuthProvider.GOOGLE : AuthProvider.FACEBOOK;

    // Generate token
    const token = this.generateToken(user, provider);

    return {
      message: 'Social login successful',
      user: {
        _id: user._id,
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        pic: user.pic,
        provider: user.provider,
        hasPassword: user.hasPassword,
        isAccountConfirmed: user.isAccountConfirmed,
      },
      token,
    };
  }

  // ============ PASSWORD RESET METHODS ============

  /**
   * Request password reset
   */
  async requestPasswordReset(resetData: PasswordResetDto) {
    const { email } = resetData;

    const user = await this.UserModel.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return {
        message:
          'If an account with this email exists, a password reset link has been sent.',
      };
    }

    if (!user.hasPassword) {
      throw new HttpException(
        'This account was registered without password. Please use OTP or social login.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = resetExpiry;
    await user.save();

    // Send reset email
    await this.sendPasswordResetEmail(email, resetToken);

    return {
      message:
        'If an account with this email exists, a password reset link has been sent.',
    };
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(resetData: PasswordResetConfirmDto) {
    const { email, resetToken, newPassword } = resetData;

    const user = await this.UserModel.findOne({
      email,
      passwordResetToken: resetToken,
      passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new HttpException(
        'Invalid or expired reset token',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update password
    user.password = await this.hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.failedLoginAttempts = 0;
    user.isAccountLocked = false;
    user.accountLockedUntil = undefined;
    await user.save();

    return {
      message:
        'Password reset successful. You can now login with your new password.',
    };
  }

  /**
   * Change password (for authenticated users)
   */
  async changePassword(userId: string, changeData: ChangePasswordDto) {
    const { currentPassword, newPassword } = changeData;

    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!user.hasPassword || !user.password) {
      throw new HttpException(
        'This account has no password set',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await this.comparePasswords(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new HttpException(
        'Current password is incorrect',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Update password
    user.password = await this.hashPassword(newPassword);
    user.failedLoginAttempts = 0;
    user.isAccountLocked = false;
    user.accountLockedUntil = undefined;
    await user.save();

    return {
      message: 'Password changed successfully',
    };
  }

  // ============ TOKEN MANAGEMENT ============

  /**
   * Generate access token
   */
  generateAccessToken(user: any, provider: AuthProvider) {
    return this.jwtService.sign(
      {
        sub: user._id,
        email: user.email,
        provider: provider,
        hasPassword: user.hasPassword,
        isAccountConfirmed: user.isAccountConfirmed,
        roles: user.roles,
      },
      {
        expiresIn: '15m', // 15 minutes
      },
    );
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(user: any) {
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store refresh token in user document
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshExpiry;
    user.save();

    return refreshToken;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshData: RefreshTokenDto) {
    const { refreshToken } = refreshData;

    const user = await this.UserModel.findOne({
      refreshToken: refreshToken,
      refreshTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new HttpException(
        'Invalid or expired refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Generate new access token
    const accessToken = this.generateAccessToken(user, user.provider);

    return {
      message: 'Token refreshed successfully',
      accessToken,
    };
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(userId: string) {
    const user = await this.UserModel.findById(userId);
    if (user) {
      user.refreshToken = undefined;
      user.refreshTokenExpiry = undefined;
      await user.save();
    }
  }

  // ============ SOCIAL AUTHENTICATION ============

  /**
   * Google Login
   */
  async googleLogin(googleUser: any) {
    const { email, name, picture, googleId } = googleUser;

    // Check if user exists
    let user = await this.UserModel.findOne({ email });

    if (!user) {
      // Create new user
      user = new this.UserModel({
        email,
        firstName: name?.split(' ')[0] || '',
        lastName: name?.split(' ').slice(1).join(' ') || '',
        userName: email.split('@')[0] + Math.floor(Math.random() * 1000),
        pic: picture,
        provider: AuthProvider.GOOGLE,
        googleId,
        hasPassword: false,
        isAccountConfirmed: true,
        isEmailVerified: true,
      });
      await user.save();
    } else {
      // Update existing user
      user.googleId = googleId;
      user.pic = picture;
      user.lastLoginAt = new Date();
      await user.save();
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user, AuthProvider.GOOGLE);
    const refreshToken = this.generateRefreshToken(user);

    return {
      message: 'Google authentication successful',
      user: {
        _id: user._id,
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        pic: user.pic,
        provider: user.provider,
        hasPassword: user.hasPassword,
        isAccountConfirmed: user.isAccountConfirmed,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Facebook Login
   */
  async facebookLogin(facebookUser: any) {
    const { email, name, picture, facebookId } = facebookUser;

    // Check if user exists
    let user = await this.UserModel.findOne({ email });

    if (!user) {
      // Create new user
      user = new this.UserModel({
        email,
        firstName: name?.split(' ')[0] || '',
        lastName: name?.split(' ').slice(1).join(' ') || '',
        userName: email.split('@')[0] + Math.floor(Math.random() * 1000),
        pic: picture,
        provider: AuthProvider.FACEBOOK,
        facebookId,
        hasPassword: false,
        isAccountConfirmed: true,
        isEmailVerified: true,
      });
      await user.save();
    } else {
      // Update existing user
      user.facebookId = facebookId;
      user.pic = picture;
      user.lastLoginAt = new Date();
      await user.save();
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user, AuthProvider.FACEBOOK);
    const refreshToken = this.generateRefreshToken(user);

    return {
      message: 'Facebook authentication successful',
      user: {
        _id: user._id,
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        pic: user.pic,
        provider: user.provider,
        hasPassword: user.hasPassword,
        isAccountConfirmed: user.isAccountConfirmed,
      },
      accessToken,
      refreshToken,
    };
  }

  // ============ UTILITY METHODS ============

  /**
   * Generate JWT token (legacy method)
   */
  generateToken(user: any, provider: AuthProvider) {
    return this.generateAccessToken(user, provider);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Send OTP email
   */
  private async sendOtpEmail(
    email: string,
    otp: number,
    type: 'signup' | 'login' = 'login',
  ) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const subject =
        type === 'signup'
          ? 'Complete Your Registration - Blog App'
          : 'Your Login Code - Blog App';

      const text =
        type === 'signup'
          ? `Welcome to Blog App! Your verification code is: ${otp}. This code is valid for 10 minutes. Please enter this code to complete your registration.`
          : `Your login code is: ${otp}. This code is valid for 10 minutes. Please enter this code to login to your account.`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: text,
        html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">${type === 'signup' ? 'Complete Your Registration' : 'Your Login Code'}</h2>
                        <p style="color: #666; font-size: 16px;">
                            ${
                              type === 'signup'
                                ? 'Welcome to Blog App! Please use the following code to complete your registration:'
                                : 'Please use the following code to login to your account:'
                            }
                        </p>
                        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
                        </div>
                        <p style="color: #666; font-size: 14px;">
                            This code is valid for 10 minutes. If you didn't request this code, please ignore this email.
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px;">
                            This is an automated message from Blog App. Please do not reply to this email.
                        </p>
                    </div>
                `,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new HttpException(
        'Failed to send OTP email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send password reset email
   */
  private async sendPasswordResetEmail(email: string, resetToken: string) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:4200'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request - Blog App',
        text: `You requested a password reset. Click the link below to reset your password: ${resetUrl}. This link is valid for 1 hour.`,
        html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Password Reset Request</h2>
                        <p style="color: #666; font-size: 16px;">
                            You requested a password reset for your Blog App account. Click the button below to reset your password:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p style="color: #666; font-size: 14px;">
                            This link is valid for 1 hour. If you didn't request this password reset, please ignore this email.
                        </p>
                        <p style="color: #999; font-size: 12px;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href="${resetUrl}">${resetUrl}</a>
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px;">
                            This is an automated message from Blog App. Please do not reply to this email.
                        </p>
                    </div>
                `,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new HttpException(
        'Failed to send password reset email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    if (!password) {
      throw new Error('Password is required for hashing');
    }
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare passwords
   */
  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    if (!plainPassword || !hashedPassword) {
      return false;
    }
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // ============ LEGACY METHODS (for backward compatibility) ============

  async validateUser(email: string, password: string, auth: any) {
    console.log('Auth service validate user');
    console.log({ email, password, auth });

    // Find user by email
    const user = await this.UserModel.findOne({ email: email });
    if (!user) {
      return { message: 'User not found', status: 404 }; // User not found
    }

    // Validate based on provider
    console.log('Auth provider', auth.provider);
    if (auth.provider === AuthProvider.GOOGLE) {
      // Google authentication check
      console.log('Google authentication check', { user });
      if (user.googleId === auth.googleId) {
        const token = this.generateToken(user, AuthProvider.GOOGLE);
        return { user, token, status: 200 };
      } else {
        return null;
      }
    } else if (auth.provider === AuthProvider.LOCAL) {
      // Local authentication check with bcrypt

      // Check if user was registered with a social provider
      if (user.provider !== AuthProvider.LOCAL) {
        return {
          message: `This account was registered with ${user.provider}. Please use ${user.provider} to login.`,
          status: 401,
        };
      }

      // Check if password exists before comparing
      if (!user.password) {
        return { message: 'Invalid credentials', status: 401 };
      }

      const isPasswordValid = await this.comparePasswords(
        password,
        user.password,
      );
      if (isPasswordValid) {
        const token = this.generateToken(user, AuthProvider.LOCAL);
        return { user, token, status: 200 };
      } else {
        return { message: 'Invalid credentials', status: 401 };
      }
    } else if (auth.provider === AuthProvider.FACEBOOK) {
      // Facebook authentication check
      if (user.facebookId === auth.facebookId) {
        const token = this.generateToken(user, AuthProvider.FACEBOOK);
        return { user, token, status: 200 };
      } else {
        return { message: 'Invalid credentials', status: 401 };
      }
    }

    return { message: 'Invalid provider', status: 401 }; // Default return if no valid provider found
  }

  async register(userData: CreateUserDto | any) {
    // Check if user already exists
    const existingUser = await this.UserModel.findOne({
      email: userData.email,
    });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // For social logins, we don't have a password
    const password = userData.password || Math.random().toString(36).slice(-8);

    // Create new user
    const user = new this.UserModel({
      email: userData.email,
      password: await this.hashPassword(password),
      userName:
        userData.userName ||
        userData.displayName ||
        userData.email.split('@')[0],
      provider: userData.provider || AuthProvider.LOCAL,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isEmailVerified: false,
      roles: ['user'],
      googleId: userData.googleId || null,
      facebookId: userData.facebookId || null,
      pic: userData.pic || null,
      hasPassword: !!userData.password,
      isAccountConfirmed: false,
    });

    await user.save();

    // Generate token
    const token = this.generateToken(
      user,
      userData.provider || AuthProvider.LOCAL,
    );

    return {
      user: {
        _id: user._id,
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        pic: user.pic,
      },
      token,
    };
  }

  async registerUser(userData: any) {
    return this.register(userData);
  }

  async login(user: any) {
    const token = this.generateToken(user, user.provider);
    const userData = user.toObject ? user.toObject() : user;

    return {
      token,
      user: {
        _id: userData._id,
        email: userData.email,
        userName: userData.userName,
        provider: userData.provider,
      },
    };
  }
}
