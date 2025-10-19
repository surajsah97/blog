# 🚀 Blog Backend Setup Guide

## 🎯 **Current Status**
Your blog backend with **comprehensive Swagger documentation** is ready, but needs MongoDB to be running.

---

## 🔧 **MongoDB Setup Options**

### **Option 1: Local MongoDB Installation (Recommended for Development)**

#### **Install MongoDB using Homebrew**
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

#### **Alternative: Download MongoDB Community Server**
1. Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Download MongoDB Community Server for macOS
3. Install and start the service

### **Option 2: MongoDB Atlas (Cloud Database - No Installation Required)**

#### **Setup MongoDB Atlas**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Get your connection string
5. Update `.env` file with Atlas connection string

#### **Update .env file for Atlas**
```env
# Replace with your Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog-app?retryWrites=true&w=majority
```

---

## 🚀 **Quick Start (After MongoDB Setup)**

### **1. Start MongoDB**
```bash
# If using Homebrew
brew services start mongodb/brew/mongodb-community

# Or start manually
mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork
```

### **2. Start Your Blog Backend**
```bash
cd /Users/user/Documents/learning/blog/blogAppBackend
npm run start:dev
```

### **3. Access Swagger Documentation**
```
🌐 URL: http://localhost:3001/api/docs
```

---

## 📋 **Environment Variables Setup**

Your `.env` file has been created with the following configuration:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/blog-app

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (for OTP and password reset)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# OAuth Configuration (optional - for social login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Client Configuration
CLIENT_URL=http://localhost:4200

# Security Configuration
BCRYPT_ROUNDS=10
ACCOUNT_LOCKOUT_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION=30m

# Server Configuration
PORT=3001
NODE_ENV=development
```

---

## 🔧 **Configuration Steps**

### **1. Update Email Configuration (Required for OTP)**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_actual_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**To get Gmail App Password:**
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account Settings
3. Generate App Password for "Mail"
4. Use the generated password in `EMAIL_PASS`

### **2. Update OAuth Configuration (Optional)**
```env
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### **3. Update JWT Secret (Important for Security)**
```env
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here
```

---

## 🧪 **Testing Your API**

### **1. Test MongoDB Connection**
```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"
```

### **2. Test Swagger Documentation**
1. Start your application: `npm run start:dev`
2. Open browser: `http://localhost:3001/api/docs`
3. Test authentication endpoints

### **3. Test Authentication Flow**
```
1. POST /api/auth/signup/password
2. POST /api/auth/login/password
3. Copy access token
4. Click "Authorize" in Swagger UI
5. Enter: Bearer YOUR_TOKEN
6. Test protected endpoints
```

---

## 🎉 **What You Have**

### ✅ **Complete Swagger Documentation**
- **34+ API endpoints** documented
- **Interactive testing** interface
- **JWT authentication** support
- **Comprehensive examples** and error documentation

### ✅ **Authentication System**
- **Password signup/login**
- **OTP signup/login**
- **Social authentication** (Google, Facebook)
- **Password reset** functionality
- **Token management** (refresh, revoke)

### ✅ **Profile Management**
- **CRUD operations** for user profiles
- **Search functionality**
- **Authentication required** for protected endpoints

### ✅ **Post Management**
- **Create, read, update, delete** posts
- **Like and comment** functionality
- **Search posts**

### ✅ **Security Features**
- **Account lockout** after failed attempts
- **Rate limiting**
- **Input validation**
- **JWT token management**

---

## 🚨 **Troubleshooting**

### **MongoDB Connection Issues**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
brew services start mongodb/brew/mongodb-community

# Check MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### **Port Already in Use**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env file
PORT=3002
```

### **Environment Variables Not Loading**
```bash
# Restart the application
npm run start:dev

# Check if .env file exists
ls -la .env
```

---

## 🎯 **Next Steps**

1. **Install and start MongoDB** (choose Option 1 or 2 above)
2. **Update email configuration** in `.env` file
3. **Start your application**: `npm run start:dev`
4. **Access Swagger UI**: `http://localhost:3001/api/docs`
5. **Test all endpoints** using the interactive interface

---

## 🌟 **Your Swagger Documentation Features**

- ✅ **Interactive API Testing** - Test all endpoints directly from browser
- ✅ **JWT Authentication** - Bearer token authentication support
- ✅ **Request/Response Examples** - Real data examples for all endpoints
- ✅ **Error Documentation** - All possible error scenarios documented
- ✅ **Data Validation** - Input validation rules clearly stated
- ✅ **Search Functionality** - Find endpoints quickly
- ✅ **Persistent Authentication** - Token saved between sessions

**Once MongoDB is running, your Swagger documentation will be fully functional!** 🚀
