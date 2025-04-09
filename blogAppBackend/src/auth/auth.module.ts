import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './utils/strategy/googleStrategy';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schemas/User.schema';
import { SessionSerializeUser } from './utils/serealizer';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './utils/strategy/jwtStrategy';
import { LocalStrategy } from './utils/strategy/localStrategy';
import { FacebookStrategy } from './utils/strategy/facebookStrategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        UsersModule,
        PassportModule,
        // Use ConfigService to get JWT secret from environment variables
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { 
                    expiresIn: configService.get<string>('JWT_EXPIRES_IN', '2d') 
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        GoogleStrategy,
        AuthService,
        SessionSerializeUser,
        JwtStrategy,
        LocalStrategy,
        FacebookStrategy
    ],
})
export class AuthModule {}
