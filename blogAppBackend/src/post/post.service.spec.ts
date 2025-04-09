import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { getModelToken } from '@nestjs/mongoose';
import { Post } from '../schemas/Post.schema';
import { Model } from 'mongoose';
import { CreatePostDto } from '../dto/post.dto';
import { NotFoundException } from '@nestjs/common';

describe('PostService', () => {
  let service: PostService;
  let model: Model<Post>;

  const mockPost = {
    _id: 'post123',
    title: 'Test Post',
    content: 'Test Content',
    author: 'user123',
    isPublished: true,
    tags: ['test'],
    likes: 0,
    comments: [],
    likedBy: [],
    slug: 'test-post',
    viewCount: 0,
    status: 'published',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockPostModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    aggregate: jest.fn(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getModelToken('Post'),
          useValue: mockPostModel
        }
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    model = module.get<Model<Post>>(getModelToken('Post'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test Content',
        tags: ['test']
      };
      const userId = 'user123';

      mockPostModel.create.mockResolvedValue(mockPost);

      const result = await service.createPost(userId,createPostDto);
      expect(result).toEqual(mockPost);
      expect(mockPostModel.create).toHaveBeenCalledWith({
        ...createPostDto,
        author: userId
      });
    });
  });

  describe('getAllPosts', () => {
    it('should return all posts with pagination', async () => {
      const query = { page: '1', limit: '10' };
      mockPostModel.exec.mockResolvedValue([mockPost]);

      const result = await service.getAllPosts(query);
      expect(result).toEqual([mockPost]);
      expect(mockPostModel.find).toHaveBeenCalled();
      expect(mockPostModel.populate).toHaveBeenCalledWith('author', 'firstName lastName email pic');
      expect(mockPostModel.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  describe('getPostById', () => {
    it('should return a post by id', async () => {
      mockPostModel.findById.mockReturnThis();
      mockPostModel.populate.mockReturnThis();
      mockPostModel.exec.mockResolvedValue(mockPost);

      const result = await service.getPostById(mockPost._id);
      expect(result).toEqual(mockPost);
      expect(mockPostModel.findById).toHaveBeenCalledWith(mockPost._id);
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostModel.findById.mockReturnThis();
      mockPostModel.populate.mockReturnThis();
      mockPostModel.exec.mockResolvedValue(null);

      await expect(service.getPostById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});