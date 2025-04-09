import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Put, 
  UseGuards, 
  Req, 
  Query,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
  HttpStatus,
  HttpException,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto, CommentDto, SearchPostDto } from '../dto/post.dto';
import { JwtAuthGuard } from '../auth/utils/guards/jwt.guard';
import { Request } from 'express';
import { Types } from 'mongoose';

// Define a type for the user property in the request
interface RequestWithUser extends Request {
  user: any;
}

@Controller('posts')
export class PostController {
  private readonly logger = new Logger(PostController.name);

  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPost(@Req() req: RequestWithUser, @Body() createPostDto: CreatePostDto) {
    try {
      const userId = this.getUserIdFromRequest(req);
      return await this.postService.createPost(userId, createPostDto);
    } catch (error) {
      throw this.handleError(error, 'createPost');
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllPosts(@Query() query: any) {
    try {
      return await this.postService.getAllPosts(query);
    } catch (error) {
      throw this.handleError(error, 'getAllPosts');
    }
  }

  @Get('featured')
  @UseGuards(JwtAuthGuard)
  async getFeaturedPosts() {
    try {
      return await this.postService.getFeaturedPosts();
    } catch (error) {
      throw this.handleError(error, 'getFeaturedPosts');
    }
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchPosts(@Query() searchDto: SearchPostDto) {
    try {
      return await this.postService.searchPosts(searchDto);
    } catch (error) {
      throw this.handleError(error, 'searchPosts');
    }
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getMyPosts(@Req() req: RequestWithUser) {
    try {
      const userId = this.getUserIdFromRequest(req);
      return await this.postService.getPostsByUser(userId);
    } catch (error) {
      throw this.handleError(error, 'getMyPosts');
    }
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserPosts(@Param('userId') userId: string) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }
      return await this.postService.getPostsByUser(userId);
    } catch (error) {
      throw this.handleError(error, 'getUserPosts');
    }
  }

  @Get('slug/:slug')
  @UseGuards(JwtAuthGuard)
  async getPostBySlug(@Param('slug') slug: string) {
    try {
      return await this.postService.getPostBySlug(slug);
    } catch (error) {
      throw this.handleError(error, 'getPostBySlug');
    }
  }

  @Get('tags/:tag')
  @UseGuards(JwtAuthGuard)
  async getPostsByTag(@Param('tag') tag: string) {
    try {
      return await this.postService.getPostsByTag(tag);
    } catch (error) {
      throw this.handleError(error, 'getPostsByTag');
    }
  }

  @Get('tags')
  @UseGuards(JwtAuthGuard)
  async getAllTags() {
    try {
      return await this.postService.getAllTags();
    } catch (error) {
      throw this.handleError(error, 'getAllTags');
    }
  }

  @Get(':id/related')
  @UseGuards(JwtAuthGuard)
  async getRelatedPosts(@Param('id') id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid post ID format');
      }
      return await this.postService.getRelatedPosts(id);
    } catch (error) {
      throw this.handleError(error, 'getRelatedPosts');
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPostById(@Param('id') id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid post ID format');
      }
      return await this.postService.getPostById(id);
    } catch (error) {
      throw this.handleError(error, 'getPostById');
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid post ID format');
      }
      const userId = this.getUserIdFromRequest(req);
      return await this.postService.updatePost(id, userId, updatePostDto);
    } catch (error) {
      throw this.handleError(error, 'updatePost');
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param('id') id: string, @Req() req: RequestWithUser) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid post ID format');
      }
      const userId = this.getUserIdFromRequest(req);
      return await this.postService.deletePost(id, userId);
    } catch (error) {
      throw this.handleError(error, 'deletePost');
    }
  }

  
  // This is likely the issue - the route might be defined incorrectly
  @Post(':id/comment')  // Make sure this matches your frontend request
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Param('id') postId: string,
    @Req() req: RequestWithUser,
    @Body() commentDto: CommentDto,
  ) {
    try {
      if (!Types.ObjectId.isValid(postId)) {
        throw new BadRequestException('Invalid post ID format');
      }
      
      // Enhanced validation with better error messages
      if (!commentDto) {
        throw new BadRequestException('Comment data is required');
      }
      
      // Check if text exists and is a string
      if (commentDto.text === undefined || commentDto.text === null) {
        throw new BadRequestException('Comment text is required');
      }
      
      if (typeof commentDto.text !== 'string') {
        throw new BadRequestException('Comment text must be a string');
      }
      
      // Trim the text to handle whitespace-only comments
      const trimmedText = commentDto.text.trim();
      
      if (trimmedText.length === 0) {
        throw new BadRequestException('Comment cannot be empty or contain only whitespace');
      }
      
      if (trimmedText.length > 1000) {
        throw new BadRequestException(`Comment is too long (${trimmedText.length} characters). Maximum allowed is 1000 characters.`);
      }
      
      // Update the DTO with the trimmed text
      commentDto.text = trimmedText;
      
      const userId = this.getUserIdFromRequest(req);
      this.logger.log(`Adding comment to post ${postId} by user ${userId}`);
      
      return await this.postService.addComment(postId, userId, commentDto);
    } catch (error) {
      throw this.handleError(error, 'addComment');
    }
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async likePost(@Param('id') id: string, @Req() req: RequestWithUser) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid post ID format');
      }
      const userId = this.getUserIdFromRequest(req);
      return await this.postService.likePost(id, userId);
    } catch (error) {
      throw this.handleError(error, 'likePost');
    }
  }

  @Post(':id/unlike')
  @UseGuards(JwtAuthGuard)
  async unlikePost(@Param('id') id: string, @Req() req: RequestWithUser) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid post ID format');
      }
      const userId = this.getUserIdFromRequest(req);
      return await this.postService.unlikePost(id, userId);
    } catch (error) {
      throw this.handleError(error, 'unlikePost');
    }
  }

  // Helper method to extract user ID from request with improved error handling
  private getUserIdFromRequest(req: RequestWithUser): string {
    if (!req.user) {
      this.logger.warn('Authentication attempt with missing user object');
      throw new UnauthorizedException('User not authenticated');
    }
    
    const userId = req.user.sub || req.user.id || req.user._id;
    if (!userId) {
      this.logger.warn(`Token missing user ID fields for user: ${JSON.stringify(req.user)}`);
      throw new UnauthorizedException('User ID not found in token');
    }
    
    if (!Types.ObjectId.isValid(userId)) {
      this.logger.warn(`Invalid user ID format: ${userId}`);
      throw new BadRequestException('Invalid user ID format');
    }
    
    return userId;
  }

  // Helper method to handle errors with improved context
  private handleError(error: any, context: string = 'operation'): never {
    if (error instanceof HttpException) {
      this.logger.error(`${context} error: ${error.message}`, error.stack);
      throw error;
    }
    
    this.logger.error(`Unexpected ${context} error: ${error.message}`, error.stack);
    throw new InternalServerErrorException(
      'An error occurred while processing your request',
      { cause: error }
    );
  }
}