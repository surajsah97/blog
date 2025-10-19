# 🚀 Blog App Backend - Complete API Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Profile Management](#profile-management)
4. [Security Features](#security-features)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Environment Setup](#environment-setup)
8. [Testing](#testing)

## 🌟 Overview

The Blog App Backend provides a comprehensive authentication and profile management system with multiple signup/login methods, enhanced security features, and robust error handling.

### Base URL
```
http://localhost:3000
```

### Authentication Methods
- ✅ **Password-based** authentication
- ✅ **OTP-based** authentication (email verification)
- ✅ **Social media** authentication (Google, Facebook)
- ✅ **Password reset** functionality
- ✅ **Token refresh** mechanism

---

## 🔐 Authentication

### 1. Signup Endpoints

#### Signup with Password
**Endpoint:** `POST /auth/signup/password`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "signupMethod": "password",
  "firstName": "John",
  "lastName": "Doe",
  "userName": "johndoe",
  "phone": "+1234567890"
}
```

**Validation Rules:**
- Email: Valid email format, required
- Password: Min 8 chars, must contain uppercase, lowercase, number, special character
- Username: 3-30 chars, alphanumeric with underscores/hyphens
- Phone: Valid international format

**Response (201 Created):**
```json
{
  "message": "User registered successfully. Please verify your email.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "hasPassword": true,
    "isAccountConfirmed": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Signup with OTP
**Endpoint:** `POST /auth/signup/otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "signupMethod": "otp",
  "firstName": "John",
  "lastName": "Doe",
  "userName": "johndoe",
  "phone": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "message": "OTP sent to your email. Please verify to complete registration.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "hasPassword": false,
    "isAccountConfirmed": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "otpExpiry": "2023-11-01T10:40:00.000Z"
}
```

#### Signup with Social Media
**Endpoint:** `POST /auth/signup/social`

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "signupMethod": "social",
  "googleId": "google_user_id_123",
  "firstName": "John",
  "lastName": "Doe",
  "userName": "johndoe",
  "pic": "https://example.com/profile.jpg"
}
```

**Response (201 Created):**
```json
{
  "message": "Social account registered successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@gmail.com",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "pic": "https://example.com/profile.jpg",
    "provider": "google",
    "hasPassword": false,
    "isAccountConfirmed": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Verify OTP for Signup
**Endpoint:** `POST /auth/verify-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": 123456
}
```

**Response (200 OK):**
```json
{
  "message": "OTP verified successfully. Account confirmed.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "hasPassword": false,
    "isAccountConfirmed": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Resend OTP for Signup
**Endpoint:** `POST /auth/resend-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "New OTP sent to your email",
  "otpExpiry": "2023-11-01T10:50:00.000Z"
}
```

### 2. Login Endpoints

#### Login with Password
**Endpoint:** `POST /auth/login/password`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "loginMethod": "password"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "pic": null,
    "provider": "local",
    "hasPassword": true,
    "isAccountConfirmed": true,
    "lastLoginAt": "2023-11-01T11:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "abc123def456..."
}
```

#### Send OTP for Login
**Endpoint:** `POST /auth/login/send-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "OTP sent to your email for login",
  "otpExpiry": "2023-11-01T11:00:00.000Z"
}
```

#### Login with OTP
**Endpoint:** `POST /auth/login/otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": 123456,
  "loginMethod": "otp"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "pic": null,
    "provider": "otp",
    "hasPassword": false,
    "isAccountConfirmed": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "abc123def456..."
}
```

#### Login with Social Media
**Endpoint:** `POST /auth/login/social`

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "googleId": "google_user_id_123"
}
```

**Response (200 OK):**
```json
{
  "message": "Social login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@gmail.com",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "pic": "https://example.com/profile.jpg",
    "provider": "google",
    "hasPassword": false,
    "isAccountConfirmed": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "abc123def456..."
}
```

### 3. Password Reset Endpoints

#### Request Password Reset
**Endpoint:** `POST /auth/password/reset`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If an account with this email exists, a password reset link has been sent."
}
```

#### Confirm Password Reset
**Endpoint:** `POST /auth/password/reset/confirm`

**Request Body:**
```json
{
  "email": "user@example.com",
  "resetToken": "abc123def456...",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successful. You can now login with your new password."
}
```

#### Change Password (Authenticated)
**Endpoint:** `POST /auth/password/change`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

### 4. Token Management Endpoints

#### Refresh Access Token
**Endpoint:** `POST /auth/token/refresh`

**Request Body:**
```json
{
  "refreshToken": "abc123def456..."
}
```

**Response (200 OK):**
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Revoke Refresh Token (Logout)
**Endpoint:** `POST /auth/token/revoke`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "Token revoked successfully"
}
```

### 5. Social Authentication Endpoints

#### Google Authentication
**Endpoint:** `GET /auth/google`

**Response:** Redirects to Google OAuth

#### Google Redirect
**Endpoint:** `GET /auth/google/redirect`

**Response:** Redirects to frontend with token or error

#### Facebook Authentication
**Endpoint:** `GET /auth/facebook`

**Response:** Redirects to Facebook OAuth

#### Facebook Redirect
**Endpoint:** `GET /auth/facebook/redirect`

**Response:** Redirects to frontend with token or error

---

## 👤 Profile Management

### 1. Get Profile Endpoints

#### Get Current User Profile
**Endpoint:** `GET /profile/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "bio": "Software Developer",
    "location": "New York, NY",
    "website": "https://johndoe.com",
    "pic": "https://example.com/profile.jpg",
    "provider": "local",
    "hasPassword": true,
    "isAccountConfirmed": true,
    "isEmailVerified": true,
    "roles": ["user"],
    "createdAt": "2023-11-01T10:30:00.000Z",
    "updatedAt": "2023-11-01T10:30:00.000Z",
    "lastLoginAt": "2023-11-01T11:00:00.000Z"
  }
}
```

#### Get User Profile by ID
**Endpoint:** `GET /profile/:userId`

**Response (200 OK):** Same as above

#### Get Full User Profile
**Endpoint:** `GET /profile/me/full`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):** Same as above

### 2. Update Profile Endpoints

#### Update Current User Profile
**Endpoint:** `PUT /profile/me`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "userName": "johndoe",
  "phone": "+1234567890",
  "bio": "Software Developer",
  "location": "New York, NY",
  "website": "https://johndoe.com",
  "pic": "https://example.com/profile.jpg"
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "bio": "Software Developer",
    "location": "New York, NY",
    "website": "https://johndoe.com",
    "pic": "https://example.com/profile.jpg",
    "provider": "local",
    "hasPassword": true,
    "isAccountConfirmed": true,
    "isEmailVerified": true,
    "roles": ["user"],
    "createdAt": "2023-11-01T10:30:00.000Z",
    "updatedAt": "2023-11-01T15:45:00.000Z"
  }
}
```

#### Update User Profile by ID
**Endpoint:** `PUT /profile/:userId`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:** Same as above

**Response (200 OK):** Same as above

### 3. Delete Profile Endpoints

#### Delete Current User Profile
**Endpoint:** `DELETE /profile/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "Profile deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "isDeleted": true,
    "deletedAt": "2023-11-01T16:00:00.000Z"
  }
}
```

#### Delete User Profile by ID
**Endpoint:** `DELETE /profile/:userId`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):** Same as above

### 4. Search Endpoints

#### Search Users
**Endpoint:** `GET /profile/search/users?q=search_query&limit=10`

**Query Parameters:**
- `q` (required): Search query
- `limit` (optional): Maximum number of results (default: 10)

**Response (200 OK):**
```json
{
  "message": "Users found successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "userName": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "pic": "https://example.com/profile.jpg"
    }
  ]
}
```

#### Get User Profile by Email
**Endpoint:** `GET /profile/email/:email`

**Response (200 OK):**
```json
{
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "bio": "Software Developer",
    "location": "New York, NY",
    "website": "https://johndoe.com",
    "pic": "https://example.com/profile.jpg",
    "provider": "local",
    "hasPassword": true,
    "isAccountConfirmed": true,
    "isEmailVerified": true,
    "roles": ["user"],
    "createdAt": "2023-11-01T10:30:00.000Z",
    "updatedAt": "2023-11-01T10:30:00.000Z"
  }
}
```

---

## 🛡️ Security Features

### Account Security
- ✅ **Account lockout** after 5 failed login attempts
- ✅ **30-minute lockout** period
- ✅ **Failed login tracking** with timestamps
- ✅ **IP address logging** for login attempts
- ✅ **Account confirmation** required before login
- ✅ **Email verification** system

### Password Security
- ✅ **Strong password requirements** (8+ chars, mixed case, numbers, special chars)
- ✅ **bcrypt hashing** with salt rounds
- ✅ **Password reset** with secure tokens
- ✅ **Password change** with current password verification
- ✅ **Password indication** tracking (`hasPassword` field)

### Token Security
- ✅ **JWT access tokens** (15-minute expiry)
- ✅ **Refresh tokens** (7-day expiry)
- ✅ **Token revocation** on logout
- ✅ **Secure token generation** with crypto.randomBytes
- ✅ **Token validation** middleware

### Rate Limiting
- ✅ **5 requests per 15 minutes** per IP/endpoint
- ✅ **Account lockout** after failed attempts
- ✅ **OTP rate limiting** (built into email sending)

### Input Validation
- ✅ **Comprehensive validation** with class-validator
- ✅ **Email format validation**
- ✅ **Phone number validation**
- ✅ **URL validation** for profile pictures and websites
- ✅ **Username format validation**
- ✅ **Password strength validation**

---

## ❌ Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid OTP. Please check your email and try again.",
  "error": "Bad Request"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You can only update your own profile",
  "error": "Forbidden"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

#### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

#### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "Account is temporarily locked due to too many failed attempts. Please try again in 25 minutes.",
  "error": "Too Many Requests"
}
```

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

### Validation Error Example
```json
{
  "statusCode": 400,
  "message": [
    "Please provide a valid email address",
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  ],
  "error": "Bad Request"
}
```

---

## ⚡ Rate Limiting

### Authentication Endpoints
- **5 requests per 15 minutes** per IP address
- **Account lockout** after 5 failed login attempts
- **30-minute lockout** period

### OTP Endpoints
- **Rate limited** by email sending service
- **10-minute OTP expiry**
- **One OTP per email** at a time

### Profile Endpoints
- **Standard rate limiting** applies
- **No special restrictions** for authenticated users

---

## 🔧 Environment Setup

### Required Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/blog-app

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Client Configuration
CLIENT_URL=http://localhost:4200

# Security
BCRYPT_ROUNDS=10
ACCOUNT_LOCKOUT_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION=30m
```

### Installation
```bash
# Install dependencies
npm install

# Install additional packages
npm install class-transformer nodemailer @types/nodemailer

# Build the application
npm run build

# Start the application
npm run start:dev
```

---

## 🧪 Testing

### Test Scripts
```bash
# Test OTP functionality
node test-otp.js

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

### Manual Testing with cURL

#### Signup with Password
```bash
curl -X POST http://localhost:3000/auth/signup/password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "signupMethod": "password",
    "firstName": "John",
    "lastName": "Doe",
    "userName": "johndoe"
  }'
```

#### Login with Password
```bash
curl -X POST http://localhost:3000/auth/login/password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "loginMethod": "password"
  }'
```

#### Get Profile
```bash
curl -X GET http://localhost:3000/profile/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Postman Collection
1. Import the provided Postman collection
2. Set environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `email`: `test@example.com`
   - `accessToken`: (will be set after login)

---

## 📊 Database Schema

### User Document Structure
```javascript
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "userName": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "bio": "Software Developer",
  "location": "New York, NY",
  "website": "https://johndoe.com",
  "pic": "https://example.com/profile.jpg",
  "password": "$2b$10$...", // bcrypt hashed
  "provider": "local", // local, otp, google, facebook
  "hasPassword": true,
  "isEmailVerified": true,
  "isAccountConfirmed": true,
  "isActive": true,
  "roles": ["user"],
  
  // OTP fields
  "otp": 123456,
  "otpExpiry": Date,
  
  // Security fields
  "failedLoginAttempts": 0,
  "lastFailedLogin": Date,
  "accountLockedUntil": Date,
  "isAccountLocked": false,
  "lastLoginAt": Date,
  "lastLoginIP": "192.168.1.1",
  
  // Token fields
  "refreshToken": "abc123...",
  "refreshTokenExpiry": Date,
  "passwordResetToken": "def456...",
  "passwordResetExpiry": Date,
  
  // Social fields
  "googleId": "google_user_id",
  "facebookId": "facebook_user_id",
  
  // Timestamps
  "createdAt": Date,
  "updatedAt": Date,
  "isDeleted": false,
  "deletedAt": Date
}
```

---

## 🚀 Deployment

### Production Checklist
- [ ] Set strong JWT secrets
- [ ] Configure production email service
- [ ] Set up MongoDB Atlas or production database
- [ ] Configure OAuth credentials
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

---

## 📈 Performance & Monitoring

### Key Metrics to Monitor
- **Authentication success/failure rates**
- **OTP delivery success rates**
- **Account lockout frequency**
- **Token refresh patterns**
- **Profile update frequency**
- **Search query performance**

### Logging
- **Request/response logging** with timing
- **Authentication attempt logging**
- **Error logging** with stack traces
- **Security event logging**

---

## 🔒 Security Best Practices

### Implemented Security Measures
1. **Input validation** and sanitization
2. **Rate limiting** and account lockout
3. **Secure password hashing** with bcrypt
4. **JWT token management** with refresh tokens
5. **Email verification** and OTP system
6. **CORS configuration** for frontend
7. **Security headers** middleware
8. **Request logging** and monitoring

### Additional Recommendations
1. **Implement 2FA** for enhanced security
2. **Add CAPTCHA** for login attempts
3. **Implement device tracking**
4. **Add audit logging** for sensitive operations
5. **Regular security audits**
6. **Dependency vulnerability scanning**

---

## 📞 Support

### Common Issues
1. **Email not received**: Check spam folder, verify email settings
2. **OTP expired**: Use resend OTP endpoint
3. **Account locked**: Wait for lockout period to expire
4. **Token expired**: Use refresh token endpoint

### Debug Steps
1. Check application logs
2. Verify environment variables
3. Test email configuration
4. Check database connectivity
5. Verify OAuth credentials

---

## 🎉 Conclusion

This comprehensive authentication system provides:
- ✅ **Multiple authentication methods**
- ✅ **Enhanced security features**
- ✅ **Robust error handling**
- ✅ **Complete profile management**
- ✅ **Professional email templates**
- ✅ **Comprehensive documentation**

The system is production-ready and follows industry best practices for security, performance, and user experience.
