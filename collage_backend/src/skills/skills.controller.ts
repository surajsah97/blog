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
import { SkillsService } from './skills.service';
import { CreateSkillDto, UpdateSkillDto } from './dto/create-skill.dto';
import { JwtAuthGuard } from '../auth/utils/guards/jwt.guard';

@ApiTags('Skills')
@Controller('skills')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all skills for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Skills retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Skills retrieved successfully' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              level: { type: 'string' },
              category: { type: 'string' },
              yearsOfExperience: { type: 'number' },
              description: { type: 'string' },
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
  async getUserSkills(@Request() req) {
    return this.skillsService.getUserSkills(req.user.userId);
  }

  @Get(':skillId')
  @ApiOperation({
    summary: 'Get a specific skill by ID for authenticated user',
  })
  @ApiParam({
    name: 'skillId',
    description: 'ID of the skill to retrieve',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Skill retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Skill retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            level: { type: 'string' },
            category: { type: 'string' },
            yearsOfExperience: { type: 'number' },
            description: { type: 'string' },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Skill not found or access denied' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserSkillById(@Param('skillId') skillId: string, @Request() req) {
    return this.skillsService.getUserSkillById(skillId, req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add new skill for authenticated user' })
  @ApiBody({ type: CreateSkillDto })
  @ApiResponse({
    status: 201,
    description: 'Skill added successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Skill added successfully' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            level: { type: 'string' },
            category: { type: 'string' },
            yearsOfExperience: { type: 'number' },
            description: { type: 'string' },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Skill already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addUserSkill(@Body() createSkillDto: CreateSkillDto, @Request() req) {
    return this.skillsService.addUserSkill(createSkillDto, req.user.userId);
  }

  @Put(':skillId')
  @ApiOperation({ summary: 'Update skill for authenticated user' })
  @ApiParam({
    name: 'skillId',
    description: 'ID of the skill to update',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateSkillDto })
  @ApiResponse({
    status: 200,
    description: 'Skill updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Skill updated successfully' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            level: { type: 'string' },
            category: { type: 'string' },
            yearsOfExperience: { type: 'number' },
            description: { type: 'string' },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Skill not found or access denied' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateUserSkill(
    @Param('skillId') skillId: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Request() req,
  ) {
    return this.skillsService.updateUserSkill(
      skillId,
      updateSkillDto,
      req.user.userId,
    );
  }

  @Delete(':skillId')
  @ApiOperation({ summary: 'Delete skill for authenticated user' })
  @ApiParam({
    name: 'skillId',
    description: 'ID of the skill to delete',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Skill deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Skill deleted successfully' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            level: { type: 'string' },
            category: { type: 'string' },
            yearsOfExperience: { type: 'number' },
            description: { type: 'string' },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Skill not found or access denied' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteUserSkill(@Param('skillId') skillId: string, @Request() req) {
    return this.skillsService.deleteUserSkill(skillId, req.user.userId);
  }
}
