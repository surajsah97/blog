# User Authentication Documentation

## Overview of Authentication Flow

### Email and Password Authentication
1. The user submits their credentials through the LoginComponent.
2. The frontend sends a request to the `/auth/login` endpoint.
3. The backend verifies the credentials and returns a JSON Web Token (JWT).
4. The frontend stores the JWT in localStorage for future requests.
5. The AuthInterceptor automatically adds the JWT to subsequent requests.

### Social Authentication (Google and Facebook)
1. The user clicks on a social login button.
2. They are redirected to the provider's authentication page.
3. After successful authentication, they are redirected back to `/auth/social-callback`.
4. The backend exchanges the received code for user information.
5. The backend returns a JWT to the frontend.

## JWT Implementation Details
- The backend uses the `@nestjs/jwt` package for JWT management.
- Tokens expire after 1 hour.
- Tokens are stored in an HttpOnly cookie for enhanced security.
- A refresh token implementation is also available.

## Protecting Routes
- The application uses an AuthGuard to protect certain routes.
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    return this.authService.isAuthenticated();
  }
}
```

## Security Measures
- Passwords are hashed using bcrypt for security.
- CSRF protection is enabled to prevent cross-site request forgery.
- Rate limiting is applied to authentication endpoints to mitigate brute force attacks.
- Input validation is enforced on all authentication forms to ensure data integrity.
