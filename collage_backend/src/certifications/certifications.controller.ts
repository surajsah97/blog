import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CertificationsService } from './certifications.service';
import {
  CreateCertificationDto,
  UpdateCertificationDto,
} from './dto/create-certification.dto';
import { JwtAuthGuard } from '../auth/utils/guards/jwt.guard';

@ApiTags('Certifications')
@Controller('certifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all certifications for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Certifications retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Certifications retrieved successfully',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              issuingOrganization: { type: 'string' },
              issueDate: { type: 'string', format: 'date' },
              expirationDate: { type: 'string', format: 'date' },
              credentialId: { type: 'string' },
              credentialUrl: { type: 'string' },
              description: { type: 'string' },
              skills: { type: 'array', items: { type: 'string' } },
              userId: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserCertifications(@Request() req) {
    return this.certificationsService.getUserCertifications(req.user.userId);
  }

  @Get(':certificationId')
  @ApiOperation({ summary: 'Get a specific certification by ID' })
  @ApiParam({
    name: 'certificationId',
    description: 'Certification ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Certification retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Certification retrieved successfully',
        },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            issuingOrganization: { type: 'string' },
            issueDate: { type: 'string', format: 'date' },
            expirationDate: { type: 'string', format: 'date' },
            credentialId: { type: 'string' },
            credentialUrl: { type: 'string' },
            description: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'Certification not found or access denied',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserCertificationById(
    @Param('certificationId') certificationId: string,
    @Request() req,
  ) {
    return this.certificationsService.getUserCertificationById(
      certificationId,
      req.user.userId,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Add new certification' })
  @ApiBody({ type: CreateCertificationDto })
  @ApiResponse({
    status: 201,
    description: 'Certification added successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Certification added successfully',
        },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            issuingOrganization: { type: 'string' },
            issueDate: { type: 'string', format: 'date' },
            expirationDate: { type: 'string', format: 'date' },
            credentialId: { type: 'string' },
            credentialUrl: { type: 'string' },
            description: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Certification already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addUserCertification(
    @Body() createCertificationDto: CreateCertificationDto,
    @Request() req,
  ) {
    return this.certificationsService.addUserCertification(
      createCertificationDto,
      req.user.userId,
    );
  }

  @Put(':certificationId')
  @ApiOperation({ summary: 'Update certification' })
  @ApiParam({
    name: 'certificationId',
    description: 'Certification ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateCertificationDto })
  @ApiResponse({
    status: 200,
    description: 'Certification updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Certification updated successfully',
        },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            issuingOrganization: { type: 'string' },
            issueDate: { type: 'string', format: 'date' },
            expirationDate: { type: 'string', format: 'date' },
            credentialId: { type: 'string' },
            credentialUrl: { type: 'string' },
            description: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'Certification not found or access denied',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateUserCertification(
    @Param('certificationId') certificationId: string,
    @Body() updateCertificationDto: UpdateCertificationDto,
    @Request() req,
  ) {
    return this.certificationsService.updateUserCertification(
      certificationId,
      updateCertificationDto,
      req.user.userId,
    );
  }

  @Delete(':certificationId')
  @ApiOperation({ summary: 'Delete certification' })
  @ApiParam({
    name: 'certificationId',
    description: 'Certification ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Certification deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Certification deleted successfully',
        },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            issuingOrganization: { type: 'string' },
            issueDate: { type: 'string', format: 'date' },
            expirationDate: { type: 'string', format: 'date' },
            credentialId: { type: 'string' },
            credentialUrl: { type: 'string' },
            description: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'Certification not found or access denied',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteUserCertification(
    @Param('certificationId') certificationId: string,
    @Request() req,
  ) {
    return this.certificationsService.deleteUserCertification(
      certificationId,
      req.user.userId,
    );
  }
}
