import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/User.schema';

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  userName?: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  pic?: string;
}

@Injectable()
export class ProfileService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string) {
    try {
      // Validate userId format (MongoDB ObjectId)
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new HttpException(
          'Invalid user ID format',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.UserModel.findById(userId).select(
        '-password -otp -otpExpiry',
      );

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Add computed fullName
      const userData = user.toObject();
      userData.fullName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.lastName || user.userName;

      return {
        message: 'User profile retrieved successfully',
        data: userData,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get user profile from JWT token
   */
  async getUserProfileFromToken(userId: string) {
    try {
      const user = await this.UserModel.findById(userId).select(
        '-password -otp -otpExpiry',
      );

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Add computed fullName
      const userData = user.toObject();
      userData.fullName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.lastName || user.userName;

      return {
        message: 'User profile retrieved successfully',
        data: userData,
      };
    } catch (error) {
      console.error('Error fetching user profile from token:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updateData: UpdateProfileDto) {
    try {
      // Validate userId format (MongoDB ObjectId)
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new HttpException(
          'Invalid user ID format',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate request body
      if (!updateData || Object.keys(updateData).length === 0) {
        throw new HttpException(
          'Request body cannot be empty',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update user profile
      const user = await this.UserModel.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select('-password -otp -otpExpiry');

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return {
        message: 'Profile updated successfully',
        data: user,
      };
    } catch (error) {
      console.error('Error updating user profile:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        throw new HttpException(
          'Validation error: ' + error.message,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Handle cast errors (invalid ObjectId)
      if (error.name === 'CastError') {
        throw new HttpException(
          'Invalid user ID format',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get full user profile with all details
   */
  async getFullUserProfile(userId: string) {
    try {
      const user = await this.UserModel.findById(userId).select(
        '-password -otp -otpExpiry',
      );

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Add computed fullName
      const userData = user.toObject();
      userData.fullName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.lastName || user.userName;

      return {
        message: 'Full profile retrieved successfully',
        data: userData,
      };
    } catch (error) {
      console.error('Error fetching full user profile:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete user profile (soft delete)
   */
  async deleteUserProfile(userId: string) {
    try {
      // Validate userId format (MongoDB ObjectId)
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new HttpException(
          'Invalid user ID format',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.UserModel.findByIdAndUpdate(
        userId,
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        { new: true },
      ).select('-password -otp -otpExpiry');

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return {
        message: 'Profile deleted successfully',
        data: user,
      };
    } catch (error) {
      console.error('Error deleting user profile:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get user profile by email
   */
  async getUserProfileByEmail(email: string) {
    try {
      const user = await this.UserModel.findOne({ email }).select(
        '-password -otp -otpExpiry',
      );

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Add computed fullName
      const userData = user.toObject();
      userData.fullName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.lastName || user.userName;

      return {
        message: 'User profile retrieved successfully',
        data: userData,
      };
    } catch (error) {
      console.error('Error fetching user profile by email:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Search users by username or email
   */
  async searchUsers(query: string, limit: number = 10) {
    try {
      const users = await this.UserModel.find({
        $or: [
          { userName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
        ],
        isDeleted: { $ne: true },
      })
        .select('-password -otp -otpExpiry')
        .limit(limit);

      // Add computed fullName to each user
      const usersWithFullName = users.map((user) => {
        const userData = user.toObject();
        userData.fullName =
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.lastName || user.userName;
        return userData;
      });

      return {
        message: 'Users found successfully',
        data: usersWithFullName,
      };
    } catch (error) {
      console.error('Error searching users:', error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
