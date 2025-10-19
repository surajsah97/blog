import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
  IsUrl,
  Length,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCertificationDto {
  @ApiProperty({
    description: 'Name of the certification',
    example: 'AWS Certified Solutions Architect',
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Certification name is required' })
  @IsString({ message: 'Certification name must be a string' })
  @Length(1, 200, {
    message: 'Certification name must be between 1 and 200 characters',
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Issuing organization',
    example: 'Amazon Web Services',
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Issuing organization is required' })
  @IsString({ message: 'Issuing organization must be a string' })
  @Length(1, 200, {
    message: 'Issuing organization must be between 1 and 200 characters',
  })
  @Transform(({ value }) => value?.trim())
  issuingOrganization: string;

  @ApiProperty({
    description: 'Issue date (ISO 8601 format)',
    example: '2023-06-15',
    format: 'date',
  })
  @IsNotEmpty({ message: 'Issue date is required' })
  @IsDateString({}, { message: 'Issue date must be a valid date' })
  issueDate: string;

  @ApiPropertyOptional({
    description: 'Expiration date (ISO 8601 format, optional)',
    example: '2026-06-15',
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Expiration date must be a valid date' })
  expirationDate?: string;

  @ApiPropertyOptional({
    description: 'Credential ID',
    example: 'AWS-123456789',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Credential ID must be a string' })
  @Length(0, 100, { message: 'Credential ID must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  credentialId?: string;

  @ApiPropertyOptional({
    description: 'Credential URL',
    example: 'https://aws.amazon.com/verification',
    format: 'uri',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Credential URL must be a valid URL' })
  credentialUrl?: string;

  @ApiPropertyOptional({
    description: 'Certification description',
    example:
      'Professional certification demonstrating expertise in AWS cloud architecture',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Length(0, 500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Related skills (array of skill names)',
    example: ['AWS', 'Cloud Computing', 'Architecture'],
    type: [String],
    maxItems: 20,
  })
  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @ArrayMaxSize(20, { message: 'Cannot have more than 20 skills' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  skills?: string[];
}

export class UpdateCertificationDto {
  @ApiPropertyOptional({
    description: 'Name of the certification',
    example: 'AWS Certified Solutions Architect Associate',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Certification name must be a string' })
  @Length(1, 200, {
    message: 'Certification name must be between 1 and 200 characters',
  })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    description: 'Issuing organization',
    example: 'Amazon Web Services',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Issuing organization must be a string' })
  @Length(1, 200, {
    message: 'Issuing organization must be between 1 and 200 characters',
  })
  @Transform(({ value }) => value?.trim())
  issuingOrganization?: string;

  @ApiPropertyOptional({
    description: 'Issue date (ISO 8601 format)',
    example: '2023-06-15',
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Issue date must be a valid date' })
  issueDate?: string;

  @ApiPropertyOptional({
    description: 'Expiration date (ISO 8601 format, optional)',
    example: '2026-06-15',
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Expiration date must be a valid date' })
  expirationDate?: string;

  @ApiPropertyOptional({
    description: 'Credential ID',
    example: 'AWS-123456789',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Credential ID must be a string' })
  @Length(0, 100, { message: 'Credential ID must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  credentialId?: string;

  @ApiPropertyOptional({
    description: 'Credential URL',
    example: 'https://aws.amazon.com/verification',
    format: 'uri',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Credential URL must be a valid URL' })
  credentialUrl?: string;

  @ApiPropertyOptional({
    description: 'Certification description',
    example:
      'Professional certification demonstrating expertise in AWS cloud architecture',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Length(0, 500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Related skills (array of skill names)',
    example: ['AWS', 'Cloud Computing', 'Architecture'],
    type: [String],
    maxItems: 20,
  })
  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @ArrayMaxSize(20, { message: 'Cannot have more than 20 skills' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  skills?: string[];
}
