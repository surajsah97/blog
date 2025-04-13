# Blog Application API Guide

## User Authentication

### Login Endpoint
**POST /auth/login**  
Allows registered users to sign in using their email and password.

**Request Format**:
```json
{
  "email": "your@email.com",
  "password": "your_password"
}
```
**Successful Response**:
```json
{
  "accessToken": "your.jwt.token.here",
  "user": {
    "id": 123,
    "email": "your@email.com"
  }
}
```

**Error Responses**:
- 400 Bad Request: Invalid email or password format
- 401 Unauthorized: Incorrect credentials

### Registration Endpoint  
**POST /auth/register**  
Creates a new user account. All fields are required.

**Request Format**:
```json
{
  "email": "new@email.com",
  "password": "secure_password123",
  "name": "Your Full Name"
}
```

**Notes**:
- Password must be at least 8 characters
- Email must be valid and unique

## Blog Post Endpoints

### GET /posts
- **Description**: Get all blog posts
- **Response**:
```json
[
  {
    "id": 1,
    "title": "First Post",
    "content": "Post content...",
    "authorId": 1
  }
]
```

### POST /posts
- **Description**: Create a new blog post
- **Request**:
```json
{
  "title": "New Post",
  "content": "Post content..."
}
```

## User Endpoints

### GET /users/me
- **Description**: Get current user profile
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name"
}
