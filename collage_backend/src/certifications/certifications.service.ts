import {
  Injectable,
  HttpException,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Certification,
  CertificationDocument,
} from './schemas/certification.schema';
import {
  CreateCertificationDto,
  UpdateCertificationDto,
} from './dto/create-certification.dto';

@Injectable()
export class CertificationsService {
  constructor(
    @InjectModel(Certification.name)
    private certificationModel: Model<CertificationDocument>,
  ) {}

  /**
   * Get all certifications for authenticated user
   */
  async getUserCertifications(userId: string) {
    try {
      const certifications = await this.certificationModel
        .find({ userId })
        .sort({ issueDate: -1 })
        .exec();

      return {
        message: 'Certifications retrieved successfully',
        data: certifications,
      };
    } catch (error) {
      console.error('Error retrieving certifications:', error);
      throw new HttpException(
        'Error retrieving certifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a specific certification by ID for authenticated user
   */
  async getUserCertificationById(certificationId: string, userId: string) {
    try {
      const certification = await this.certificationModel
        .findOne({
          _id: certificationId,
          userId,
        })
        .exec();

      if (!certification) {
        throw new HttpException(
          'Certification not found or access denied',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        message: 'Certification retrieved successfully',
        data: certification,
      };
    } catch (error) {
      console.error('Error retrieving certification:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error retrieving certification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Add new certification for authenticated user
   */
  async addUserCertification(
    createCertificationDto: CreateCertificationDto,
    userId: string,
  ) {
    try {
      // Validate required fields
      const { name, issuingOrganization, issueDate } = createCertificationDto;

      // Validate date format and logic
      const issueDateObj = new Date(issueDate);
      if (isNaN(issueDateObj.getTime())) {
        throw new HttpException(
          'Invalid issue date format',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (createCertificationDto.expirationDate) {
        const expirationDateObj = new Date(
          createCertificationDto.expirationDate,
        );
        if (isNaN(expirationDateObj.getTime())) {
          throw new HttpException(
            'Invalid expiration date format',
            HttpStatus.BAD_REQUEST,
          );
        }

        // Validate that expiration date is after issue date
        if (expirationDateObj <= issueDateObj) {
          throw new HttpException(
            'Expiration date must be after issue date',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Check if certification already exists for this user
      const existingCertification = await this.certificationModel
        .findOne({
          name: name.trim(),
          issuingOrganization: issuingOrganization.trim(),
          userId,
        })
        .exec();

      if (existingCertification) {
        throw new ConflictException(
          'You have already added this certification from this organization',
        );
      }

      const certificationData = {
        ...createCertificationDto,
        userId,
        name: name.trim(),
        issuingOrganization: issuingOrganization.trim(),
        issueDate: issueDateObj,
        expirationDate: createCertificationDto.expirationDate
          ? new Date(createCertificationDto.expirationDate)
          : undefined,
      };

      const newCertification = new this.certificationModel(certificationData);
      const savedCertification = await newCertification.save();

      return {
        message: 'Certification added successfully',
        data: savedCertification,
      };
    } catch (error) {
      console.error('Error adding certification:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error adding certification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update certification for authenticated user
   */
  async updateUserCertification(
    certificationId: string,
    updateCertificationDto: UpdateCertificationDto,
    userId: string,
  ) {
    try {
      // Validate dates if provided
      if (updateCertificationDto.issueDate) {
        const issueDateObj = new Date(updateCertificationDto.issueDate);
        if (isNaN(issueDateObj.getTime())) {
          throw new HttpException(
            'Invalid issue date format',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (updateCertificationDto.expirationDate) {
        const expirationDateObj = new Date(
          updateCertificationDto.expirationDate,
        );
        if (isNaN(expirationDateObj.getTime())) {
          throw new HttpException(
            'Invalid expiration date format',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Find and update certification (only if it belongs to the authenticated user)
      const updatedCertification = await this.certificationModel
        .findOneAndUpdate(
          { _id: certificationId, userId },
          {
            ...updateCertificationDto,
            updatedAt: new Date(),
            ...(updateCertificationDto.issueDate && {
              issueDate: new Date(updateCertificationDto.issueDate),
            }),
            ...(updateCertificationDto.expirationDate && {
              expirationDate: new Date(updateCertificationDto.expirationDate),
            }),
          },
          { new: true, runValidators: true },
        )
        .exec();

      if (!updatedCertification) {
        throw new HttpException(
          'Certification not found or access denied',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        message: 'Certification updated successfully',
        data: updatedCertification,
      };
    } catch (error) {
      console.error('Error updating certification:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error updating certification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete certification for authenticated user
   */
  async deleteUserCertification(certificationId: string, userId: string) {
    try {
      const deletedCertification = await this.certificationModel
        .findOneAndDelete({
          _id: certificationId,
          userId,
        })
        .exec();

      if (!deletedCertification) {
        throw new HttpException(
          'Certification not found or access denied',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        message: 'Certification deleted successfully',
        data: deletedCertification,
      };
    } catch (error) {
      console.error('Error deleting certification:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error deleting certification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
