import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/User.schema';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly attempts = new Map<
    string,
    { count: number; resetTime: number }
  >();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    const attempt = this.attempts.get(key);

    if (attempt) {
      if (now < attempt.resetTime) {
        if (attempt.count >= this.maxAttempts) {
          throw new HttpException(
            'Too many requests. Please try again later.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        attempt.count++;
      } else {
        this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      }
    } else {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
    }

    next();
  }
}

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()',
    );

    // Remove server information
    res.removeHeader('X-Powered-By');

    next();
  }
}

@Injectable()
export class AccountLockoutMiddleware implements NestMiddleware {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const email = req.body?.email;

    if (email && (req.path.includes('/login') || req.path.includes('/otp'))) {
      try {
        const user = await this.UserModel.findOne({ email });

        if (user && user.isAccountLocked && user.accountLockedUntil) {
          if (new Date() < user.accountLockedUntil) {
            const remainingTime = Math.ceil(
              (user.accountLockedUntil.getTime() - new Date().getTime()) /
                60000,
            );
            throw new HttpException(
              `Account is temporarily locked. Please try again in ${remainingTime} minutes.`,
              HttpStatus.TOO_MANY_REQUESTS,
            );
          } else {
            // Unlock account if lockout period has expired
            user.isAccountLocked = false;
            user.accountLockedUntil = undefined;
            user.failedLoginAttempts = 0;
            await user.save();
          }
        }
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        // Continue if user not found or other errors
      }
    }

    next();
  }
}

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, url, ip } = req;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;

      console.log(`${method} ${url} ${statusCode} ${duration}ms - ${ip}`);
    });

    next();
  }
}
