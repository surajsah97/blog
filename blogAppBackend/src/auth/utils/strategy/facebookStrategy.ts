import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy, StrategyOptions } from 'passport-facebook';
import { AuthService } from 'src/auth/auth.service';
import { AuthDto, AuthProvider } from 'src/dto/auth.dto';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly authService: AuthService,
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
    console.log("Facebook strategy validate");
    
    const facebookUserData: AuthDto = {
      email: String(profile.emails?.[0]?.value),
      displayName: profile.displayName || '',
      pic: profile.photos?.[0]?.value || '',
      facebookId: profile.id,
      firstName: profile.name?.givenName || '',
      lastName: profile.name?.familyName || '',
      provider: AuthProvider.FACEBOOK,
    };
    
    // Validate the user with AuthService
    const result = await this.authService.validateUser(
        facebookUserData.email,
        "", // No password for Facebook auth - Added comma here
        {
            provider: AuthProvider.FACEBOOK,
            facebookId: facebookUserData.facebookId
        }
    );
    
    if (result?.status==200) {
        console.log({result},"=-=-=--==--=")
          return result; // Return user and token
      }
      else if(result?.status==404){
        // Change this line:
        const createUser = this.authService.register(facebookUserData);
        return createUser
      }
    return facebookUserData; // Return just the profile data if not validated
  }
}
