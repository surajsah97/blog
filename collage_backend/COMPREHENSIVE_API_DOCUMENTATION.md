# Blog App Backend - Comprehensive Authentication & Profile API Documentation

## Overview
This documentation covers the complete authentication system and profile management for the Blog App Backend, including signup with password/OTP, login with various methods, and comprehensive profile CRUD operations.

## Base URL
```
http://localhost:3000
```

## Authentication Endpoints

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
  "loginMethod": "local"
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
    "isAccountConfirmed": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Social Authentication Endpoints

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

## Profile Management Endpoints

### 1. Get Profile Endpoints

#### Get Current User Profile
**Endpoint:** `GET /profile/me`

**Headers:**
```
Authorization: Bearer <jwt_token>
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
    "updatedAt": "2023-11-01T10:30:00.000Z"
  }
}
```

#### Get User Profile by ID
**Endpoint:** `GET /profile/:userId`

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

#### Get Full User Profile
**Endpoint:** `GET /profile/me/full`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "message": "Full profile retrieved successfully",
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

### 2. Update Profile Endpoints

#### Update Current User Profile
**Endpoint:** `PUT /profile/me`

**Headers:**
```
Authorization: Bearer <jwt_token>
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
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:** Same as above

**Response (200 OK):** Same as above

### 3. Delete Profile Endpoints

#### Delete Current User Profile
**Endpoint:** `DELETE /profile/me`

**Headers:**
```
Authorization: Bearer <jwt_token>
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
Authorization: Bearer <jwt_token>
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

## Error Responses

### Common Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid OTP",
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

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Authentication Flow Examples

### 1. Password Signup Flow
1. `POST /auth/signup/password` - Register with password
2. User receives verification email
3. User verifies email (if required)
4. `POST /auth/login/password` - Login with password

### 2. OTP Signup Flow
1. `POST /auth/signup/otp` - Register with OTP
2. User receives OTP via email
3. `POST /auth/verify-otp` - Verify OTP to confirm account
4. `POST /auth/login/send-otp` - Send OTP for login
5. `POST /auth/login/otp` - Login with OTP

### 3. Social Signup Flow
1. `GET /auth/google` or `GET /auth/facebook` - Redirect to social provider
2. User authorizes the app
3. `GET /auth/google/redirect` or `GET /auth/facebook/redirect` - Handle callback
4. If new user: `POST /auth/signup/social` - Register social account
5. If existing user: `POST /auth/login/social` - Login with social account

## Environment Variables

Add these to your `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/blog-app

# JWT
JWT_SECRET=your_jwt_secret_key

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

# Client URL
CLIENT_URL=http://localhost:4200
```

## Key Features

### Authentication Methods
- ✅ Password-based signup and login
- ✅ OTP-based signup and login
- ✅ Social media signup and login (Google, Facebook)
- ✅ Account confirmation system
- ✅ Password indication (hasPassword field)

### Profile Management
- ✅ Complete CRUD operations
- ✅ JWT-based authentication
- ✅ User search functionality
- ✅ Profile by email lookup
- ✅ Soft delete functionality
- ✅ Comprehensive validation

### Security Features
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ OTP expiration (10 minutes)
- ✅ Email verification
- ✅ Account confirmation system
- ✅ Proper error handling

### User Experience
- ✅ Multiple signup/login options
- ✅ Clear error messages
- ✅ Comprehensive API documentation
- ✅ Consistent response format
- ✅ Profile search and discovery
