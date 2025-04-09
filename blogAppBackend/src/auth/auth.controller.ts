import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { CreateUserDto } from "src/dto/createUser.dto";
import { AuthService } from "./auth.service";
import { LocalGuard } from "./utils/guards/local.guards";
import { GoogleAuthGuard } from "./utils/guards/google.guards";
import { Request, Response } from "express";  // Added Response import
import { AuthGuard } from "@nestjs/passport";
import { FacebookAuthGuard } from "./utils/guards/facebook.guard";
import { AuthDto } from "src/dto/auth.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleLogin() {
        return { msg: 'Google Authentication' };
    }

    // Update the Google redirect handler to redirect to frontend
    @Get('google/redirect')
    @UseGuards(GoogleAuthGuard)
    async googleRedirect(@Req() request: Request, @Res() response: Response) {
        if (request.user) {
            // Check if user has token property (authenticated user)
            if ('token' in request.user) {
                const { user, token } = request.user as any;
                
                // Redirect to frontend with token and user data
                const userData = encodeURIComponent(JSON.stringify(user));
                return response.redirect(`http://localhost:4200/auth/social-callback?token=${token}&user=${userData}`);
            } else {
                // New user from Google, not yet in our database
                const userData = encodeURIComponent(JSON.stringify(request.user));
                return response.redirect(`http://localhost:4200/auth/social-callback?error=Registration required&user=${userData}`);
            }
        } else {
            return response.redirect('http://localhost:4200/auth/social-callback?error=Authentication failed');
        }
    }

    // Facebook login endpoint
    @Get("/facebook")
    @UseGuards(FacebookAuthGuard)
    async facebookLogin(): Promise<any> {
        return HttpStatus.OK;
    }

    // Update Facebook redirect handler to redirect to frontend
    @Get("/facebook/redirect")
    @UseGuards(FacebookAuthGuard)
    async facebookLoginRedirect(@Req() req: Request, @Res() response: Response): Promise<any> {
        if (req.user) {
            // Check if user has token property (authenticated user)
            if ('token' in req.user) {
                const { user, token } = req.user as any;
                
                // Redirect to frontend with token and user data
                const userData = encodeURIComponent(JSON.stringify(user));
                return response.redirect(`http://localhost:4200/auth/social-callback?token=${token}&user=${userData}`);
            } else {
                // New user from Facebook, not yet in our database
                const userData = encodeURIComponent(JSON.stringify(req.user));
                return response.redirect(`http://localhost:4200/auth/social-callback?error=Registration required&user=${userData}`);
            }
        } else {
            return response.redirect('http://localhost:4200/auth/social-callback?error=Authentication failed');
        }
    }

    // Update the local login handler
    @Post("login")
    @UseGuards(LocalGuard)
    async login(@Req() request: Request) {
        if (request.user) {
            // For local login, we should always have a token
            const { user, token } = request.user as any;
            console.log('User:', user,token,{uuu: request.user});
            return { ...request.user,
                msg: 'User logged in', 
                user,
                token // Include the JWT token in the response
            };
        } else {
            return { msg: 'Invalid credentials' };
        }
    }

    @Post('register')
    async register(@Body() createUserDto: AuthDto) {
        try {
            const result = await this.authService.register(createUserDto);
            return result;
        } catch (error) {
            console.error(error);
            if (error.code === 11000) { // MongoDB duplicate key error
                throw new HttpException('Email already exists', HttpStatus.CONFLICT);
            }
            throw new HttpException('Registration failed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
