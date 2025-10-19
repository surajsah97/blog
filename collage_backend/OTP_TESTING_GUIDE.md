# OTP Authentication Testing Guide

## Overview
This guide demonstrates how to test the OTP signup and login functionality in the Blog App Backend.

## Prerequisites
1. Ensure the backend is running on `http://localhost:3000`
2. Configure email settings in `.env` file:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

## OTP Signup Flow

### Step 1: Signup with OTP
**Endpoint:** `POST /auth/signup/otp`

**Request:**
```bash
curl -X POST http://localhost:3000/auth/signup/otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "signupMethod": "otp",
    "firstName": "John",
    "lastName": "Doe",
    "userName": "johndoe",
    "phone": "+1234567890"
  }'
```

**Expected Response:**
```json
{
  "message": "OTP sent to your email. Please verify to complete registration.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "test@example.com",
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

### Step 2: Check Email for OTP
- Check the email inbox for the OTP code
- The email will contain a 6-digit code valid for 10 minutes

### Step 3: Verify OTP
**Endpoint:** `POST /auth/verify-otp`

**Request:**
```bash
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": 123456
  }'
```

**Expected Response:**
```json
{
  "message": "OTP verified successfully. Account confirmed.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "test@example.com",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "hasPassword": false,
    "isAccountConfirmed": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Step 4: Resend OTP (if needed)
**Endpoint:** `POST /auth/resend-otp`

**Request:**
```bash
curl -X POST http://localhost:3000/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Expected Response:**
```json
{
  "message": "New OTP sent to your email",
  "otpExpiry": "2023-11-01T10:50:00.000Z"
}
```

## OTP Login Flow

### Step 1: Send OTP for Login
**Endpoint:** `POST /auth/login/send-otp`

**Request:**
```bash
curl -X POST http://localhost:3000/auth/login/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Expected Response:**
```json
{
  "message": "OTP sent to your email for login",
  "otpExpiry": "2023-11-01T11:00:00.000Z"
}
```

### Step 2: Check Email for Login OTP
- Check the email inbox for the login OTP code
- The email will contain a 6-digit code valid for 10 minutes

### Step 3: Login with OTP
**Endpoint:** `POST /auth/login/otp`

**Request:**
```bash
curl -X POST http://localhost:3000/auth/login/otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": 123456,
    "loginMethod": "otp"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "test@example.com",
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

## Error Scenarios

### Invalid OTP
**Request:** Same as verify OTP but with wrong code
**Response:**
```json
{
  "statusCode": 400,
  "message": "Invalid OTP. Please check your email and try again.",
  "error": "Bad Request"
}
```

### Expired OTP
**Request:** Same as verify OTP but after 10 minutes
**Response:**
```json
{
  "statusCode": 400,
  "message": "OTP expired. Please request a new OTP.",
  "error": "Bad Request"
}
```

### User Not Found
**Request:** Login with non-existent email
**Response:**
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

### Account Not Confirmed
**Request:** Login before verifying OTP
**Response:**
```json
{
  "statusCode": 400,
  "message": "Account not confirmed. Please verify your email first.",
  "error": "Bad Request"
}
```

## Testing with Postman

### Collection Setup
1. Create a new Postman collection called "Blog App OTP Auth"
2. Set base URL variable: `{{baseUrl}} = http://localhost:3000`

### Environment Variables
Create environment variables:
- `baseUrl`: `http://localhost:3000`
- `email`: `test@example.com`
- `otp`: `123456` (update with actual OTP from email)
- `token`: (will be set after successful auth)

### Test Sequence
1. **Signup with OTP** → Save token and user ID
2. **Check Email** → Get actual OTP code
3. **Verify OTP** → Update token
4. **Test Profile Access** → Use token for authenticated requests
5. **Send Login OTP** → Get new OTP for login
6. **Login with OTP** → Update token
7. **Test Profile Access** → Verify login worked

## Frontend Integration Example

### React/Next.js Example
```javascript
// Signup with OTP
const signupWithOtp = async (userData) => {
  const response = await fetch('/api/auth/signup/otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...userData,
      signupMethod: 'otp'
    })
  });
  return response.json();
};

// Verify OTP
const verifyOtp = async (email, otp) => {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  return response.json();
};

// Login with OTP
const loginWithOtp = async (email, otp) => {
  const response = await fetch('/api/auth/login/otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email, 
      otp, 
      loginMethod: 'otp' 
    })
  });
  return response.json();
};
```

## Security Features

### OTP Security
- ✅ 6-digit random OTP generation
- ✅ 10-minute expiration time
- ✅ OTP cleared after successful verification
- ✅ Rate limiting (can be added)
- ✅ Email validation

### Account Security
- ✅ Account confirmation required before login
- ✅ Email verification
- ✅ JWT token authentication
- ✅ Proper error handling
- ✅ No password storage for OTP users

## Monitoring and Logs

### Check Logs
```bash
# View application logs
tail -f logs/application.log

# Check email sending logs
grep "OTP" logs/application.log
```

### Database Verification
```javascript
// Check user status in MongoDB
db.users.findOne({email: "test@example.com"})

// Expected result:
{
  "_id": ObjectId("..."),
  "email": "test@example.com",
  "userName": "johndoe",
  "provider": "otp",
  "hasPassword": false,
  "isAccountConfirmed": true,
  "isEmailVerified": true,
  "otp": null,  // Cleared after verification
  "otpExpiry": null  // Cleared after verification
}
```

## Troubleshooting

### Common Issues
1. **Email not received**: Check spam folder, verify email settings
2. **OTP expired**: Use resend OTP endpoint
3. **Invalid OTP**: Check email carefully, OTP is case-sensitive
4. **Account not confirmed**: Verify OTP first before login

### Debug Steps
1. Check email configuration in `.env`
2. Verify MongoDB connection
3. Check application logs for errors
4. Test with different email addresses
5. Verify OTP generation in database
