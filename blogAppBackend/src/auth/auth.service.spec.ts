import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/User.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let model: Model<User>;

  const mockUser = {
    _id: 'user123',
    email: 'test@test.com',
    password: 'hashedPassword',
    userName: 'testuser',
    provider: 'local'
  };

  const mockUserModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn()
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token')
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  // Remove the 'login' describe block and replace with these tests
  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const email = 'test@test.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      mockUserModel.findOne.mockResolvedValue({
        ...mockUser,
        password: hashedPassword
      });

      const result = await service.validateUser(email, password, { provider: 'local' });
      expect(result?.status).toBe(200);
      expect(result?.user).toBeDefined();
      expect(result?.token).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const email = 'test@test.com';
      const password = 'wrongpassword';
      
      mockUserModel.findOne.mockResolvedValue({
        ...mockUser,
        password: await bcrypt.hash('password123', 10)
      });

      const result = await service.validateUser(email, password, { provider: 'local' });
      expect(result?.status).toBe(401);
      expect(result?.message).toBe('Invalid credentials');
    });

    it('should return 404 for non-existent user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@test.com', 'password', { provider: 'local' });
      expect(result?.status).toBe(404);
      expect(result?.message).toBe('User not found');
    });
  });

  describe('login', () => {
    it('should return token and user data', async () => {
      const mockLoginUser = {
        ...mockUser,
        toObject: () => ({
          _id: mockUser._id,
          email: mockUser.email,
          userName: mockUser.userName,
          provider: mockUser.provider
        })
      };

      const expectedResponse = {
        token: 'test-token',
        user: {
          _id: mockUser._id,
          email: mockUser.email,
          userName: mockUser.userName,
          provider: mockUser.provider
        }
      };

      const loginResult = await service.login(mockLoginUser);
      
      expect(loginResult).toEqual(expectedResponse);
      expect(jwtService.sign).toHaveBeenCalledWith({ 
        sub: mockUser._id,
        email: mockUser.email 
      });
    });
  });
});