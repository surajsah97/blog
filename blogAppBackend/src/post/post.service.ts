import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from '../schemas/Post.schema';
import { CreatePostDto, UpdatePostDto, CommentDto, SearchPostDto } from '../dto/post.dto';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    @InjectModel('Post') private postModel: Model<Post>,
  ) {}

  // Create a new post
  async createPost(userId: string, createPostDto: CreatePostDto): Promise<Post> {
    try {
      if (!userId || !Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }

      // Generate slug if not provided
      if (!createPostDto.slug && createPostDto.title) {
        createPostDto.slug = this.generateSlug(createPostDto.title);
      }

      // Check if slug already exists
      if (createPostDto.slug) {
        const existingPost = await this.postModel.findOne({ slug: createPostDto.slug });
        if (existingPost) {
          throw new BadRequestException(`Post with slug "${createPostDto.slug}" already exists`);
        }
      }

      // Ensure tags are an array and filter out empty values
      if (createPostDto.tags) {
        if (!Array.isArray(createPostDto.tags)) {
          createPostDto.tags = [createPostDto.tags];
        }
        createPostDto.tags = createPostDto.tags.filter(tag => tag && tag.trim().length > 0);
      } else {
        createPostDto.tags = [];
      }

      const newPost = new this.postModel({
        ...createPostDto,
        author: new Types.ObjectId(userId),
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        viewCount: 0,
        likedBy: [],
        comments: []
      });
      
      const savedPost = await newPost.save();
      return savedPost;
      // return await this.postModel.findById(savedPost._id)
      //   .populate('author', 'firstName lastName email pic')
      //   .exec();
    } catch (error) {
      throw this.handleError(error, 'createPost');
    }
  }

  // Get all posts (with optional filtering)
  async getAllPosts(query: any = {}): Promise<Post[]> {
    try {
      // Add pagination support
      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : 10;
      const skip = (page - 1) * limit;
      
      // Remove pagination params from query
      const { page: _, limit: __, ...filterQuery } = query;
      
      return await this.postModel.find(filterQuery)
        .populate('author', 'firstName lastName email pic')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    } catch (error) {
      throw this.handleError(error, 'getAllPosts');
    }
  }

  // Get posts by a specific user
  async getPostsByUser(userId: string): Promise<Post[]> {
    try {
      if (!userId || !Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }

      return await this.postModel.find({ author: userId })
        .populate('author', 'firstName lastName email pic')
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw this.handleError(error, 'getPostsByUser');
    }
  }

  // Get a single post by ID
  async getPostById(postId: string): Promise<Post> {
    try {
      if (!postId || !Types.ObjectId.isValid(postId)) {
        throw new BadRequestException('Invalid post ID');
      }

      const post = await this.postModel.findById(postId)
        .populate('author', 'firstName lastName email pic')
        .populate('comments.user', 'firstName lastName email pic')
        .exec();
      
      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }
      
      return post;
    } catch (error) {
      throw this.handleError(error, 'getPostById');
    }
  }

  // Update a post
  async updatePost(postId: string, userId: string, updatePostDto: UpdatePostDto): Promise<Post> {
    try {
      if (!postId || !Types.ObjectId.isValid(postId)) {
        throw new BadRequestException('Invalid post ID');
      }
      
      if (!userId || !Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }

      const post = await this.postModel.findById(postId);
      
      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }
      
      // Check if the user is the author of the post
      if (post.author.toString() !== userId.toString()) {
        this.logger.warn(`Unauthorized update attempt by user ${userId} for post ${postId}`);
        throw new UnauthorizedException('You are not authorized to update this post');
      }
      
      // If slug is being updated, ensure it's unique
      if (updatePostDto.slug) {
        const existingPostWithSlug = await this.postModel.findOne({ 
          slug: updatePostDto.slug,
          _id: { $ne: postId } // Exclude current post
        });
        
        if (existingPostWithSlug) {
          throw new BadRequestException(`Post with slug "${updatePostDto.slug}" already exists`);
        }
      }
      
      // Ensure tags are an array
      if (updatePostDto.tags && !Array.isArray(updatePostDto.tags)) {
        updatePostDto.tags = [updatePostDto.tags];
      }
      
      // Add updatedAt timestamp
      const updatedData = {
        ...updatePostDto,
        updatedAt: new Date()
      };
      
      const updatedPost = await this.postModel.findByIdAndUpdate(
        postId,
        updatedData,
        { new: true, runValidators: true }
      ).populate('author', 'firstName lastName email pic');
      
      if (!updatedPost) {
        throw new InternalServerErrorException('Failed to update post');
      }
      
      return updatedPost;
    } catch (error) {
      throw this.handleError(error, 'updatePost');
    }
  }

  // Delete a post
  async deletePost(postId: string, userId: string): Promise<{ message: string }> {
    try {
      if (!postId || !Types.ObjectId.isValid(postId)) {
        throw new BadRequestException('Invalid post ID');
      }
      
      if (!userId || !Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }

      const post = await this.postModel.findById(postId);
      
      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }
      
      // Check if the user is the author of the post
      if (post.author.toString() !== userId.toString()) {
        this.logger.warn(`Unauthorized delete attempt by user ${userId} for post ${postId}`);
        throw new UnauthorizedException('You are not authorized to delete this post');
      }
      
      const result = await this.postModel.findByIdAndDelete(postId);
      if (!result) {
        throw new InternalServerErrorException('Failed to delete post');
      }
      return { message: 'Post deleted successfully' };
    } catch (error) {
      throw this.handleError(error, 'deletePost');
    }
  }

  // Add a comment to a post
  async addComment(postId: string, userId: string, commentDto: CommentDto): Promise<Post> {
    try {
      if (!postId || !Types.ObjectId.isValid(postId)) {
        throw new BadRequestException('Invalid post ID');
      }
      
      if (!userId || !Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }

      if (!commentDto || !commentDto.text) {
        throw new BadRequestException('Comment text is required');
      }

      // Generate a unique ID for the comment
      const commentId = new Types.ObjectId();

      // Use findOneAndUpdate for atomic operation
      const post = await this.postModel.findOneAndUpdate(
        { _id: postId },
        { 
          $push: { 
            comments: {
              _id: commentId,
              user: userId,
              text: commentDto.text,
              createdAt: new Date()
            } 
          } 
        },
        { new: true }
      )
      .populate('author', 'firstName lastName email pic')
      .populate('comments.user', 'firstName lastName email pic');
      
      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }
      
      return post;
    } catch (error) {
      throw this.handleError(error, 'addComment');
    }
  }

  // Delete a comment
  async deleteComment(postId: string, commentId: string, userId: string): Promise<Post> {
    try {
      // Validate inputs
      if (!postId || !Types.ObjectId.isValid(postId)) {
        throw new BadRequestException('Invalid post ID');
      }
      
      if (!commentId || !Types.ObjectId.isValid(commentId)) {
        throw new BadRequestException('Invalid comment ID');
      }
      
      if (!userId || !Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }

      // Convert IDs to ObjectId instances
      const postObjectId = new Types.ObjectId(postId);
      const commentObjectId = new Types.ObjectId(commentId);
      const userObjectId = new Types.ObjectId(userId);
      
      // First check if user is authorized (either post author or comment author)
      const post = await this.postModel.findOne({
        _id: postObjectId,
        $or: [
          { author: userObjectId },
          { 'comments': { $elemMatch: { _id: commentObjectId, user: userObjectId } } }
        ]
      });
      
      if (!post) {
        // Check if post exists at all
        const postExists = await this.postModel.findById(postObjectId);
        if (!postExists) {
          throw new NotFoundException(`Post with ID ${postId} not found`);
        }
        
        // Check if comment exists
        const commentExists = await this.postModel.findOne({
          _id: postObjectId,
          'comments._id': commentObjectId
        });
        
        if (!commentExists) {
          throw new NotFoundException(`Comment with ID ${commentId} not found`);
        }
        
        // If we get here, user is not authorized
        this.logger.warn(`Unauthorized comment delete attempt by user ${userId}`);
        throw new UnauthorizedException('You are not authorized to delete this comment');
      }
      
      // User is authorized, perform the deletion in one operation
      const updatedPost = await this.postModel.findByIdAndUpdate(
        postObjectId,
        { $pull: { comments: { _id: commentObjectId } } },
        { new: true }
      )
      .populate('author', 'firstName lastName email pic')
      .populate('comments.user', 'firstName lastName email pic');
      
      if (!updatedPost) {
        throw new InternalServerErrorException('Failed to delete comment');
      }
      
      return updatedPost;
    } catch (error) {
      throw this.handleError(error, 'deleteComment');
    }
  }

  // Like a post
  async likePost(postId: string, userId: string): Promise<Post> {
    try {
      if (!postId || !Types.ObjectId.isValid(postId)) {
        throw new BadRequestException('Invalid post ID');
      }
      
      if (!userId || !Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }

      // Use findOneAndUpdate for atomic operation
      const post = await this.postModel.findOneAndUpdate(
        { 
          _id: postId,
          likedBy: { $ne: userId } // Only update if user hasn't liked already
        },
        { 
          $addToSet: { likedBy: userId },
          $inc: { likes: 1 }
        },
        { new: true }
      ).populate('author', 'firstName lastName email pic');
      
      if (!post) {
        // Check if post exists
        const existingPost = await this.postModel.findById(postId)
          .populate('author', 'firstName lastName email pic');
        
        if (!existingPost) {
          throw new NotFoundException(`Post with ID ${postId} not found`);
        }
        
        return existingPost; // User already liked the post
      }
      
      return post;
    } catch (error) {
      throw this.handleError(error, 'likePost');
    }
  }

  // Unlike a post
  async unlikePost(postId: string, userId: string): Promise<Post> {
    try {
      if (!postId || !Types.ObjectId.isValid(postId)) {
        throw new BadRequestException('Invalid post ID');
      }
      
      if (!userId || !Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }
  
      // Use findOneAndUpdate for atomic operation
      const post = await this.postModel.findOneAndUpdate(
        { 
          _id: postId,
          likedBy: userId // Only update if user has liked
        },
        { 
          $pull: { likedBy: userId },
          $inc: { likes: -1 }
        },
        { new: true }
      ).populate('author', 'firstName lastName email pic');
      
      if (!post) {
        // Check if post exists
        const existingPost = await this.postModel.findById(postId)
          .populate('author', 'firstName lastName email pic');
        
        if (!existingPost) {
          throw new NotFoundException(`Post with ID ${postId} not found`);
        }
        
        return existingPost; // User hasn't liked the post
      }
      
      return post;
    } catch (error) {
      throw this.handleError(error, 'unlikePost');
    }
  }

  // Get featured posts
  async getFeaturedPosts(): Promise<Post[]> {
    try {
      return await this.postModel.find({ featured: true, isPublished: true })
        .populate('author', 'firstName lastName email pic')
        .sort({ createdAt: -1 })
        .limit(5)
        .exec();
    } catch (error) {
      throw this.handleError(error, 'getFeaturedPosts');
    }
  }

  // Search posts
  async searchPosts(searchDto: SearchPostDto): Promise<Post[]> {
    try {
      const query: any = { isPublished: true };
      
      if (searchDto.searchTerm) {
        query.$text = { $search: searchDto.searchTerm };
      }
      
      if (searchDto.tag) {
        query.tags = { $in: [searchDto.tag] };
      }
      
      if (searchDto.author) {
        if (!Types.ObjectId.isValid(searchDto.author)) {
          throw new BadRequestException('Invalid author ID format');
        }
        query.author = searchDto.author;
      }
      
      if (searchDto.status) {
        query.status = searchDto.status;
      }
      
      if (searchDto.featured !== undefined) {
        query.featured = searchDto.featured;
      }
      
      // Add pagination
      const page = searchDto.page ? parseInt(searchDto.page.toString(), 10) : 1;
      const limit = searchDto.limit ? parseInt(searchDto.limit.toString(), 10) : 10;
      const skip = (page - 1) * limit;
      
      return await this.postModel.find(query)
        .populate('author', 'firstName lastName email pic')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    } catch (error) {
      throw this.handleError(error, 'searchPosts');
    }
  }

  // Get post by slug
  async getPostBySlug(slug: string): Promise<Post> {
    try {
      if (!slug) {
        throw new BadRequestException('Slug is required');
      }
      
      const post = await this.postModel.findOne({ slug })
        .populate('author', 'firstName lastName email pic')
        .populate('comments.user', 'firstName lastName email pic')
        .exec();
      
      if (!post) {
        throw new NotFoundException(`Post with slug "${slug}" not found`);
      }
      
      // Increment view count
      post.viewCount = (post.viewCount || 0) + 1;
      await post.save();
      
      return post;
    } catch (error) {
      throw this.handleError(error, 'getPostBySlug');
    }
  }

  // Get posts by tag
  async getPostsByTag(tag: string): Promise<Post[]> {
    try {
      if (!tag) {
        throw new BadRequestException('Tag is required');
      }
      
      return await this.postModel.find({ 
        tags: { $in: [tag] },
        isPublished: true 
      })
        .populate('author', 'firstName lastName email pic')
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw this.handleError(error, 'getPostsByTag');
    }
  }

  // Get all tags
  async getAllTags(): Promise<string[]> {
    try {
      const result = await this.postModel.aggregate([
        { $match: { isPublished: true } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags' } },
        { $sort: { _id: 1 } }
      ]);
      
      return result.map(item => item._id);
    } catch (error) {
      throw this.handleError(error, 'getAllTags');
    }
  }

  // Get related posts
  async getRelatedPosts(postId: string, limit: number = 3): Promise<Post[]> {
    try {
      if (!postId || !Types.ObjectId.isValid(postId)) {
        throw new BadRequestException('Invalid post ID');
      }
      
      const post = await this.postModel.findById(postId);
      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }
      
      // Find posts with similar tags
      return await this.postModel.find({
        _id: { $ne: postId },
        tags: { $in: post.tags || [] },
        isPublished: true
      })
        .populate('author', 'firstName lastName email pic')
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      throw this.handleError(error, 'getRelatedPosts');
    }
  }

  // Helper method to generate slug from title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  }

  // Helper method to safely access nested properties
  private safeGet(obj: any, path: string, defaultValue: any = undefined): any {
    try {
      const keys = path.split('.');
      return keys.reduce((o, key) => (o && o[key] !== undefined) ? o[key] : defaultValue, obj);
    } catch (error) {
      return defaultValue;
    }
  }

  // Helper method to handle errors
  private handleError(error: any, context: string = 'operation'): Error {
    if (error instanceof NotFoundException || 
        error instanceof UnauthorizedException || 
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException) {
      this.logger.error(`Error during ${context}: ${error.message}`, error.stack);
      return error;
    }
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      this.logger.error(`Duplicate key error during ${context}: ${JSON.stringify(error.keyValue)}`);
      return new BadRequestException(`Duplicate value for ${Object.keys(error.keyValue).join(', ')}`);
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      this.logger.error(`Validation error during ${context}: ${messages.join(', ')}`);
      return new BadRequestException(`Validation failed: ${messages.join(', ')}`);
    }
    
    // Handle CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      this.logger.error(`Cast error during ${context}: ${error.message}`);
      return new BadRequestException(`Invalid ${error.path}: ${error.value}`);
    }
    
    // Handle network/connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      this.logger.error(`Database connection error during ${context}: ${error.message}`, error.stack);
      return new InternalServerErrorException('Database connection error', { cause: error });
    }
    
    // Handle timeout errors
    if (error.name === 'TimeoutError') {
      this.logger.error(`Timeout error during ${context}: ${error.message}`, error.stack);
      return new InternalServerErrorException('Operation timed out', { cause: error });
    }
    
    this.logger.error(`Unexpected error during ${context}: ${error.message}`, error.stack);
    return new InternalServerErrorException(
      'An error occurred while processing your request', 
      { cause: error, description: error.message }
    );
  }
}