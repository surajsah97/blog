import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SkillLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert',
}

export enum SkillCategory {
  PROGRAMMING = 'Programming',
  FRAMEWORK = 'Framework',
  DATABASE = 'Database',
  TOOL = 'Tool',
  LANGUAGE = 'Language',
  SOFT_SKILL = 'Soft Skill',
  OTHER = 'Other',
}

export class CreateSkillDto {
  @ApiProperty({
    description: 'Name of the skill',
    example: 'JavaScript',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Skill name is required' })
  @IsString({ message: 'Skill name must be a string' })
  @Length(1, 100, {
    message: 'Skill name must be between 1 and 100 characters',
  })
  name: string;

  @ApiProperty({
    description: 'Proficiency level of the skill',
    enum: SkillLevel,
    example: SkillLevel.INTERMEDIATE,
  })
  @IsNotEmpty({ message: 'Skill level is required' })
  @IsEnum(SkillLevel, {
    message: 'Skill level must be Beginner, Intermediate, Advanced, or Expert',
  })
  level: SkillLevel;

  @ApiProperty({
    description: 'Category of the skill',
    enum: SkillCategory,
    example: SkillCategory.PROGRAMMING,
  })
  @IsNotEmpty({ message: 'Skill category is required' })
  @IsEnum(SkillCategory, {
    message:
      'Skill category must be Programming, Framework, Database, Tool, Language, Soft Skill, or Other',
  })
  category: SkillCategory;

  @ApiPropertyOptional({
    description: 'Years of experience with this skill',
    example: 3,
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Years of experience must be a number' })
  @Min(0, { message: 'Years of experience cannot be negative' })
  @Max(50, { message: 'Years of experience cannot exceed 50' })
  yearsOfExperience?: number;

  @ApiPropertyOptional({
    description: 'Description of the skill',
    example: 'Strong foundation in ES6+, React, and Node.js',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Length(0, 500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}

export class UpdateSkillDto {
  @ApiPropertyOptional({
    description: 'Name of the skill',
    example: 'TypeScript',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Skill name must be a string' })
  @Length(1, 100, {
    message: 'Skill name must be between 1 and 100 characters',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Proficiency level of the skill',
    enum: SkillLevel,
    example: SkillLevel.ADVANCED,
  })
  @IsOptional()
  @IsEnum(SkillLevel, {
    message: 'Skill level must be Beginner, Intermediate, Advanced, or Expert',
  })
  level?: SkillLevel;

  @ApiPropertyOptional({
    description: 'Category of the skill',
    enum: SkillCategory,
    example: SkillCategory.FRAMEWORK,
  })
  @IsOptional()
  @IsEnum(SkillCategory, {
    message:
      'Skill category must be Programming, Framework, Database, Tool, Language, Soft Skill, or Other',
  })
  category?: SkillCategory;

  @ApiPropertyOptional({
    description: 'Years of experience with this skill',
    example: 4,
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Years of experience must be a number' })
  @Min(0, { message: 'Years of experience cannot be negative' })
  @Max(50, { message: 'Years of experience cannot exceed 50' })
  yearsOfExperience?: number;

  @ApiPropertyOptional({
    description: 'Description of the skill',
    example: 'Expert in TypeScript with React and Node.js',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Length(0, 500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}
