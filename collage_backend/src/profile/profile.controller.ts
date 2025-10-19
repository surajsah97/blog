import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProfileService, UpdateProfileDto } from './profile.service';
import { JwtAuthGuard } from '../auth/utils/guards/jwt.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * Get profile from JWT token (current user)
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Get the profile of the currently authenticated user from JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        email: { type: 'string', example: 'user@example.com' },
        userName: { type: 'string', example: 'johndoe123' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        pic: { type: 'string', example: 'https://example.com/profile.jpg' },
        phone: { type: 'string', example: '+1234567890' },
        bio: { type: 'string', example: 'Software developer' },
        location: { type: 'string', example: 'San Francisco, CA' },
        website: { type: 'string', example: 'https://johndoe.com' },
        provider: { type: 'string', example: 'local' },
        hasPassword: { type: 'boolean', example: true },
        isAccountConfirmed: { type: 'boolean', example: true },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T12:00:00.000Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMyProfile(@Req() req: any) {
    try {
      const userId = req.user.sub; // Extract user ID from JWT token
      return await this.profileService.getUserProfileFromToken(userId);
    } catch (error) {
      console.error('Get my profile error:', error);
      throw new HttpException(
        error.message || 'Failed to get profile',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get profile by userId parameter
   */
  @Get(':userId')
  async getUserProfile(@Param('userId') userId: string) {
    try {
      return await this.profileService.getUserProfile(userId);
    } catch (error) {
      console.error('Get user profile error:', error);
      throw new HttpException(
        error.message || 'Failed to get profile',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update user profile
   */
  @Put(':userId')
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @Param('userId') userId: string,
    @Body() updateData: UpdateProfileDto,
    @Req() req: any,
  ) {
    try {
      // Check if user is updating their own profile
      const currentUserId = req.user.sub;
      if (currentUserId !== userId) {
        throw new HttpException(
          'You can only update your own profile',
          HttpStatus.FORBIDDEN,
        );
      }

      return await this.profileService.updateUserProfile(userId, updateData);
    } catch (error) {
      console.error('Update user profile error:', error);
      throw new HttpException(
        error.message || 'Failed to update profile',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update current user's profile
   */
  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateMyProfile(@Body() updateData: UpdateProfileDto, @Req() req: any) {
    try {
      const userId = req.user.sub;
      return await this.profileService.updateUserProfile(userId, updateData);
    } catch (error) {
      console.error('Update my profile error:', error);
      throw new HttpException(
        error.message || 'Failed to update profile',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get full user profile with all details
   */
  @Get('me/full')
  @UseGuards(JwtAuthGuard)
  async getMyFullProfile(@Req() req: any) {
    try {
      const userId = req.user.sub;
      return await this.profileService.getFullUserProfile(userId);
    } catch (error) {
      console.error('Get my full profile error:', error);
      throw new HttpException(
        error.message || 'Failed to get full profile',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get full user profile by userId
   */
  @Get(':userId/full')
  async getFullUserProfile(@Param('userId') userId: string) {
    try {
      return await this.profileService.getFullUserProfile(userId);
    } catch (error) {
      console.error('Get full user profile error:', error);
      throw new HttpException(
        error.message || 'Failed to get full profile',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete user profile (soft delete)
   */
  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  async deleteUserProfile(@Param('userId') userId: string, @Req() req: any) {
    try {
      // Check if user is deleting their own profile
      const currentUserId = req.user.sub;
      if (currentUserId !== userId) {
        throw new HttpException(
          'You can only delete your own profile',
          HttpStatus.FORBIDDEN,
        );
      }

      return await this.profileService.deleteUserProfile(userId);
    } catch (error) {
      console.error('Delete user profile error:', error);
      throw new HttpException(
        error.message || 'Failed to delete profile',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete current user's profile
   */
  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteMyProfile(@Req() req: any) {
    try {
      const userId = req.user.sub;
      return await this.profileService.deleteUserProfile(userId);
    } catch (error) {
      console.error('Delete my profile error:', error);
      throw new HttpException(
        error.message || 'Failed to delete profile',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Search users by query
   */
  @Get('search/users')
  async searchUsers(@Query('q') query: string, @Query('limit') limit?: string) {
    try {
      if (!query) {
        throw new HttpException(
          'Search query is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const limitNumber = limit ? parseInt(limit, 10) : 10;
      return await this.profileService.searchUsers(query, limitNumber);
    } catch (error) {
      console.error('Search users error:', error);
      throw new HttpException(
        error.message || 'Failed to search users',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get user profile by email
   */
  @Get('email/:email')
  async getUserProfileByEmail(@Param('email') email: string) {
    try {
      return await this.profileService.getUserProfileByEmail(email);
    } catch (error) {
      console.error('Get user profile by email error:', error);
      throw new HttpException(
        error.message || 'Failed to get profile by email',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
