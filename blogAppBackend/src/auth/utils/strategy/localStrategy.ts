import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthProvider } from "src/dto/auth.dto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(private readonly authService: AuthService) {
        super({ usernameField: 'email', passwordField: 'password' });       
    }

    async validate(email: string, password: string) {
        console.log({localstrats:"hi there",email,password})
        const user = await this.authService.validateUser(email, password, {
            provider: AuthProvider.LOCAL,
            password: password,
            googleId: null,
            facebookId: null
        });
        
        if(!user){
            throw new UnauthorizedException('Invalid credentials');
        }
        return user;
    }
}