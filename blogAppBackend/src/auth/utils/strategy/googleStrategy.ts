import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, StrategyOptions } from "passport-google-oauth20";
import { AuthService } from "../../auth.service";
import { AuthDto, AuthProvider } from "src/dto/auth.dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
      private readonly authService: AuthService,
      private readonly configService: ConfigService,
    ) {
      super({
        clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
        clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
        callbackURL:
          configService.get<string>('GOOGLE_CALLBACK_URL') ||
          'http://localhost:3001/api/auth/google/redirect',
        scope: ['email', 'profile'],
      } as StrategyOptions); 
    }
  

    async validate(accessToken: string, refreshToken: string, profile: Profile) {
        console.log("Google strategy validate");
        
        const googleUserData: AuthDto = {
            email: String(profile.emails?.[0]?.value),
            displayName: profile.displayName || '',
            pic: profile.photos?.[0]?.value || '',
            googleId: profile.id,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            provider: AuthProvider.GOOGLE,
        };
        
        // Validate the user with AuthService
        const result = await this.authService.validateUser(
            googleUserData.email,
            "", // No password for Google auth
            {
                provider: AuthProvider.GOOGLE,
                googleId: googleUserData.googleId
            }
        );
        
        if (result?.status==200) {
          console.log({result},"=-=-=--==--=")
            return result; // Return user and token
        }
        else if(result?.status==404){
          // Change this line:
          const createUser = this.authService.register(googleUserData);
          return createUser
        }
        
        return googleUserData; // Return just the profile data if not validated
    }
}