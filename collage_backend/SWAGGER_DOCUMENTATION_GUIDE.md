# 📚 Swagger API Documentation Guide

## 🎉 **Swagger Documentation Successfully Implemented!**

Your blog backend now has **comprehensive Swagger/OpenAPI documentation** with interactive API testing capabilities.

---

## 🚀 **Access Swagger Documentation**

### **Swagger UI Interface**
```
🌐 URL: http://localhost:3001/api/docs
```

### **Features Available**
- ✅ **Interactive API Testing** - Test all endpoints directly from the browser
- ✅ **Request/Response Examples** - See exactly what data to send and expect
- ✅ **Authentication Support** - JWT Bearer token authentication
- ✅ **Comprehensive Documentation** - All endpoints documented with descriptions
- ✅ **Error Response Examples** - See all possible error scenarios
- ✅ **Data Validation** - Input validation rules clearly documented

---

## 📋 **API Endpoints Documentation**

### **🔐 Authentication Endpoints**

#### **Signup Endpoints**
- **`POST /api/auth/signup/password`** - Signup with password
- **`POST /api/auth/signup/otp`** - Signup with OTP
- **`POST /api/auth/verify-otp`** - Verify OTP for signup
- **`POST /api/auth/resend-otp`** - Resend OTP for signup

#### **Login Endpoints**
- **`POST /api/auth/login/password`** - Login with password
- **`POST /api/auth/login/send-otp`** - Send OTP for login
- **`POST /api/auth/login/otp`** - Login with OTP

#### **Password Management**
- **`POST /api/auth/password/reset`** - Request password reset
- **`POST /api/auth/password/reset/confirm`** - Confirm password reset
- **`POST /api/auth/password/change`** - Change password (authenticated)

#### **Token Management**
- **`POST /api/auth/token/refresh`** - Refresh access token
- **`POST /api/auth/token/revoke`** - Revoke refresh token (logout)

#### **Social Authentication**
- **`GET /api/auth/google`** - Google OAuth
- **`GET /api/auth/google/redirect`** - Google OAuth callback
- **`GET /api/auth/facebook`** - Facebook OAuth
- **`GET /api/auth/facebook/redirect`** - Facebook OAuth callback

### **👤 Profile Management Endpoints**

#### **Profile Operations**
- **`GET /api/profile/me`** - Get current user profile (authenticated)
- **`GET /api/profile/:userId`** - Get user profile by ID
- **`GET /api/profile/me/full`** - Get full user profile (authenticated)
- **`GET /api/profile/email/:email`** - Get user profile by email

#### **Profile Updates**
- **`PUT /api/profile/me`** - Update current user profile (authenticated)
- **`PUT /api/profile/:userId`** - Update user profile by ID (authenticated)

#### **Profile Deletion**
- **`DELETE /api/profile/me`** - Delete current user profile (authenticated)
- **`DELETE /api/profile/:userId`** - Delete user profile by ID (authenticated)

#### **Profile Search**
- **`GET /api/profile/search/users`** - Search users

### **📝 Post Management Endpoints**

#### **Post Operations**
- **`POST /api/posts`** - Create new post (authenticated)
- **`GET /api/posts`** - Get all posts with pagination
- **`GET /api/posts/:id`** - Get post by ID
- **`PUT /api/posts/:id`** - Update post (authenticated)
- **`DELETE /api/posts/:id`** - Delete post (authenticated)

#### **Post Interactions**
- **`POST /api/posts/:id/like`** - Like/unlike post (authenticated)
- **`POST /api/posts/:id/comment`** - Add comment to post (authenticated)
- **`DELETE /api/posts/:id/comment/:commentId`** - Delete comment (authenticated)

#### **Post Search**
- **`GET /api/posts/search`** - Search posts

### **👥 User Management Endpoints**

#### **User Operations**
- **`POST /api/users`** - Create user
- **`GET /api/users`** - Get all users (authenticated)
- **`GET /api/users/:id`** - Get user by ID (authenticated)

---

## 🔧 **Swagger Configuration**

### **Main Configuration**
```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('Blog App API')
  .setDescription('Comprehensive API documentation for Blog App with authentication, profile management, and post operations')
  .setVersion('1.0')
  .addTag('Authentication', 'User authentication and authorization endpoints')
  .addTag('Profile', 'User profile management endpoints')
  .addTag('Posts', 'Blog post management endpoints')
  .addTag('Users', 'User management endpoints')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .addServer('http://localhost:3001', 'Development server')
  .addServer('https://your-production-domain.com', 'Production server')
  .build();
```

### **Swagger UI Customization**
```typescript
SwaggerModule.setup('api/docs', app, document, {
  swaggerOptions: {
    persistAuthorization: true,        // Keep auth token between sessions
    displayRequestDuration: true,      // Show request duration
    docExpansion: 'none',             // Collapse all sections by default
    filter: true,                     // Enable search filter
    showRequestHeaders: true,          // Show request headers
    showCommonExtensions: true,       // Show common extensions
    tryItOutEnabled: true,           // Enable "Try it out" functionality
  },
  customSiteTitle: 'Blog App API Documentation',
  customfavIcon: '/favicon.ico',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6; }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 10px; border-radius: 5px; }
  `,
});
```

---

## 🔐 **Authentication in Swagger**

### **JWT Bearer Token Authentication**
1. **Login** using any authentication endpoint
2. **Copy the access token** from the response
3. **Click "Authorize"** button in Swagger UI
4. **Enter token** in format: `Bearer YOUR_ACCESS_TOKEN`
5. **Click "Authorize"** to authenticate
6. **Test protected endpoints** - they will now include the token automatically

### **Token Format**
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE2NDA5OTUyMDAsImV4cCI6MTY0MDk5NjEwMH0.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

## 📊 **API Documentation Features**

### **✅ Comprehensive Documentation**
- **Request/Response Examples** - Real data examples for all endpoints
- **Error Response Documentation** - All possible error scenarios documented
- **Data Validation Rules** - Input validation requirements clearly stated
- **Authentication Requirements** - Which endpoints require authentication
- **HTTP Status Codes** - All possible response codes documented

### **✅ Interactive Testing**
- **Try It Out** - Test endpoints directly from the browser
- **Request Builder** - Easy-to-use form for building requests
- **Response Viewer** - Formatted response display
- **Error Handling** - Clear error messages and status codes

### **✅ Developer-Friendly Features**
- **Search Functionality** - Find endpoints quickly
- **Collapsible Sections** - Organized by tags/categories
- **Persistent Authentication** - Token saved between sessions
- **Request Duration** - See how long requests take
- **Custom Styling** - Professional appearance

---

## 🧪 **Testing with Swagger**

### **1. Authentication Flow Testing**
```
1. POST /api/auth/signup/password
   - Create a new user account
   - Copy the response data

2. POST /api/auth/login/password
   - Login with the created account
   - Copy the accessToken from response

3. Click "Authorize" in Swagger UI
   - Enter: Bearer YOUR_ACCESS_TOKEN
   - Click "Authorize"

4. Test protected endpoints
   - GET /api/profile/me
   - POST /api/posts
   - etc.
```

### **2. OTP Flow Testing**
```
1. POST /api/auth/signup/otp
   - Create account with OTP
   - Check email for OTP

2. POST /api/auth/verify-otp
   - Verify the OTP received
   - Account becomes confirmed

3. POST /api/auth/login/send-otp
   - Request OTP for login
   - Check email for OTP

4. POST /api/auth/login/otp
   - Login with OTP
   - Get access token
```

### **3. Password Reset Flow Testing**
```
1. POST /api/auth/password/reset
   - Request password reset
   - Check email for reset link

2. POST /api/auth/password/reset/confirm
   - Use token from email
   - Set new password

3. POST /api/auth/login/password
   - Login with new password
```

---

## 🎯 **Swagger Decorators Used**

### **Controller Decorators**
```typescript
@ApiTags('Authentication')           // Group endpoints by tag
@Controller('auth')
export class AuthController {
```

### **Method Decorators**
```typescript
@ApiOperation({ 
  summary: 'Login with password',
  description: 'Authenticate user with email and password...'
})
@ApiBody({ type: LoginDto })
@ApiResponse({ 
  status: 200, 
  description: 'Login successful.',
  schema: { /* response schema */ }
})
@ApiResponse({ status: 400, description: 'Invalid credentials' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

### **Authentication Decorators**
```typescript
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
```

### **DTO Decorators**
```typescript
@ApiProperty({
  description: 'User email address',
  example: 'user@example.com',
  format: 'email'
})
@IsEmail()
email: string;

@ApiPropertyOptional({
  description: 'User password (min 8 chars)',
  example: 'SecurePass123!',
  minLength: 8
})
@IsOptional()
password?: string;
```

---

## 🚀 **Getting Started with Swagger**

### **1. Start the Application**
```bash
cd /Users/user/Documents/learning/blog/blogAppBackend
npm run start:dev
```

### **2. Access Swagger UI**
```
Open browser: http://localhost:3001/api/docs
```

### **3. Test Authentication**
```
1. Try POST /api/auth/signup/password
2. Try POST /api/auth/login/password
3. Copy access token
4. Click "Authorize" button
5. Enter: Bearer YOUR_TOKEN
6. Test protected endpoints
```

### **4. Explore All Endpoints**
```
- Authentication endpoints (signup, login, password reset)
- Profile management endpoints
- Post management endpoints
- User management endpoints
```

---

## 📈 **Benefits of Swagger Documentation**

### **For Developers**
- ✅ **Interactive Testing** - Test APIs without Postman/curl
- ✅ **Clear Documentation** - Understand API structure quickly
- ✅ **Request Examples** - See exactly what data to send
- ✅ **Response Examples** - Know what to expect back
- ✅ **Error Documentation** - Understand all error scenarios

### **For Frontend Integration**
- ✅ **API Contract** - Clear understanding of API structure
- ✅ **Data Models** - Know exact data types and validation
- ✅ **Authentication Flow** - Understand token-based auth
- ✅ **Error Handling** - Know all possible error responses

### **For API Testing**
- ✅ **Manual Testing** - Test endpoints directly in browser
- ✅ **Authentication Testing** - Test protected endpoints easily
- ✅ **Data Validation** - See validation rules in action
- ✅ **Response Verification** - Verify response structure

---

## 🎉 **Congratulations!**

Your blog backend now has:

### ✅ **Complete Swagger Documentation**
- All API endpoints documented
- Interactive testing interface
- Authentication support
- Comprehensive examples

### ✅ **Professional API Documentation**
- Clear descriptions and examples
- Error response documentation
- Data validation rules
- Developer-friendly interface

### ✅ **Production-Ready Features**
- JWT authentication support
- Interactive testing capabilities
- Custom styling and branding
- Persistent authentication

### ✅ **Easy Integration**
- Frontend developers can easily understand the API
- Clear request/response examples
- Authentication flow documentation
- Error handling guidance

**Access your Swagger documentation at: `http://localhost:3001/api/docs`** 🚀
