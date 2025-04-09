import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthDto, AuthProvider } from 'src/dto/auth.dto';
import { CreateUserDto } from 'src/dto/createUser.dto';
import { User } from 'src/schemas/User.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>, 
        private jwtService: JwtService
    ) {}

    async validateUser(email: string, password: string, auth: any) {
        console.log('Auth service validate user');
        console.log({email, password, auth});

        // Find user by email
        const user = await this.UserModel.findOne({ email: email });
        if (!user) {
            return {message:"User not found",status:404}; // User not found
        }

        // Validate based on provider
        console.log('Auth provider', auth.provider);
        if (auth.provider === AuthProvider.GOOGLE) {
            // Google authentication check
            console.log('Google authentication check',{user});
            if (user.googleId === auth.googleId) {
                const token = this.generateToken(user, AuthProvider.GOOGLE);
                return { user, token, status:200 };
            } else {
                return null;
            }
        } else if (auth.provider === AuthProvider.LOCAL) {
            // Local authentication check with bcrypt
            
            // Check if user was registered with a social provider
            if (user.provider !== AuthProvider.LOCAL) {
                return {
                    message: `This account was registered with ${user.provider}. Please use ${user.provider} to login.`,
                    status: 401
                };
            }
            
            // Check if password exists before comparing
            if (!user.password) {
                return {message:"Invalid credentials",status:401};
            }
            
            const isPasswordValid = await this.comparePasswords(password, user.password);
            if (isPasswordValid) {
                const token = this.generateToken(user, AuthProvider.LOCAL);
                return { user, token, status:200 };
            } else {
                return {message:"Invalid credentials",status:401};
            }
        } else if (auth.provider === AuthProvider.FACEBOOK) {
            // Facebook authentication check
            if (user.facebookId === auth.facebookId) {
                const token = this.generateToken(user, AuthProvider.FACEBOOK);
                return { user, token, status:200 };
            } else {
                return {message:"Invalid credentials",status:401};
            }
        }

        return {message:"Invalid provider",status:401};  // Default return if no valid provider found
    }

    // Generate JWT token with user info and provider
    generateToken(user: any, provider: AuthProvider) {
        return this.jwtService.sign({
            sub: user._id,
            email: user.email,
            provider: provider
        });
    }

    // Verify JWT token
    verifyToken(token: string) {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            return null;
        }
    }

    async register(userData: CreateUserDto | any) {
        // Check if user already exists
        const existingUser = await this.UserModel.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error('User already exists');
        }
        
        // For social logins, we don't have a password
        const password = userData.password || Math.random().toString(36).slice(-8);
        
        // Create new user
        const user = new this.UserModel({
            email: userData.email,
            password: await this.hashPassword(password),
            userName: userData.userName || userData.displayName || userData.email.split('@')[0],
            provider: userData.provider || AuthProvider.LOCAL,
            firstName: userData.firstName,
            lastName: userData.lastName,
            isEmailVerified: false,
            roles: ['user'],
            googleId: userData.googleId || null,
            facebookId: userData.facebookId || null,
            pic: userData.pic || null
        });
        
        await user.save();
        
        // Generate token
        const token = this.generateToken(user, userData.provider || AuthProvider.LOCAL);
        
        return { 
            user: {
                _id: user._id,
                email: user.email,
                userName: user.userName,
                firstName: user.firstName,
                lastName: user.lastName,
                pic: user.pic
            }, 
            token
        };
    }
    
    // Helper method to hash passwords
    private async hashPassword(password: string): Promise<string> {
        if (!password) {
            throw new Error('Password is required for hashing');
        }
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        return bcrypt.hash(password, salt);
    }
    
    // Helper method to compare passwords
    private async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
        if (!plainPassword || !hashedPassword) {
            return false;
        }
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    // Add this method as an alias for register
    async registerUser(userData: any) {
        return this.register(userData);
    }

    async login(user: any) {
        const token = this.generateToken(user, user.provider);
        const userData = user.toObject ? user.toObject() : user;
        
        return {
            token,
            user: {
                _id: userData._id,
                email: userData.email,
                userName: userData.userName,
                provider: userData.provider
            }
        };
    }
}
