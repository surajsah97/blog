import {
  Injectable,
  HttpException,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Skill, SkillDocument } from './schemas/skill.schema';
import { CreateSkillDto, UpdateSkillDto } from './dto/create-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(Skill.name) private skillModel: Model<SkillDocument>,
  ) {}

  /**
   * Get all skills for authenticated user
   */
  async getUserSkills(userId: string) {
    try {
      const skills = await this.skillModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .exec();

      return {
        message: 'Skills retrieved successfully',
        data: skills,
      };
    } catch (error) {
      console.error('Error retrieving skills:', error);
      throw new HttpException(
        'Error retrieving skills',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a specific skill by ID for authenticated user
   */
  async getUserSkillById(skillId: string, userId: string) {
    try {
      const skill = await this.skillModel
        .findOne({
          _id: skillId,
          userId,
        })
        .exec();

      if (!skill) {
        throw new HttpException(
          'Skill not found or access denied',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        message: 'Skill retrieved successfully',
        data: skill,
      };
    } catch (error) {
      console.error('Error retrieving skill:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error retrieving skill',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Add new skill for authenticated user
   */
  async addUserSkill(createSkillDto: CreateSkillDto, userId: string) {
    try {
      // Check if skill already exists for this user
      const existingSkill = await this.skillModel
        .findOne({
          name: createSkillDto.name.trim(),
          userId,
        })
        .exec();

      if (existingSkill) {
        throw new ConflictException('You have already added this skill');
      }

      const skillData = {
        ...createSkillDto,
        userId,
        name: createSkillDto.name.trim(),
      };

      const newSkill = new this.skillModel(skillData);
      const savedSkill = await newSkill.save();

      return {
        message: 'Skill added successfully',
        data: savedSkill,
      };
    } catch (error) {
      console.error('Error adding skill:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.code === 11000) {
        throw new ConflictException('You have already added this skill');
      }
      throw new HttpException(
        'Error adding skill',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update skill for authenticated user
   */
  async updateUserSkill(
    skillId: string,
    updateSkillDto: UpdateSkillDto,
    userId: string,
  ) {
    try {
      const updatedSkill = await this.skillModel
        .findOneAndUpdate(
          { _id: skillId, userId },
          { ...updateSkillDto, updatedAt: new Date() },
          { new: true, runValidators: true },
        )
        .exec();

      if (!updatedSkill) {
        throw new HttpException(
          'Skill not found or access denied',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        message: 'Skill updated successfully',
        data: updatedSkill,
      };
    } catch (error) {
      console.error('Error updating skill:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error updating skill',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete skill for authenticated user
   */
  async deleteUserSkill(skillId: string, userId: string) {
    try {
      const deletedSkill = await this.skillModel
        .findOneAndDelete({
          _id: skillId,
          userId,
        })
        .exec();

      if (!deletedSkill) {
        throw new HttpException(
          'Skill not found or access denied',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        message: 'Skill deleted successfully',
        data: deletedSkill,
      };
    } catch (error) {
      console.error('Error deleting skill:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error deleting skill',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
