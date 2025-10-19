#!/usr/bin/env node

/**
 * OTP Authentication Test Script
 * This script demonstrates the OTP signup and login functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@example.com';

// Helper function to make API calls
async function apiCall(method, endpoint, data = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(`❌ Error calling ${method} ${endpoint}:`, error.response?.data || error.message);
        throw error;
    }
}

// Test OTP Signup Flow
async function testOtpSignup() {
    console.log('\n🚀 Testing OTP Signup Flow...\n');
    
    try {
        // Step 1: Signup with OTP
        console.log('1️⃣ Signing up with OTP...');
        const signupResult = await apiCall('POST', '/auth/signup/otp', {
            email: TEST_EMAIL,
            signupMethod: 'otp',
            firstName: 'John',
            lastName: 'Doe',
            userName: 'johndoe',
            phone: '+1234567890'
        });
        
        console.log('✅ Signup successful!');
        console.log('📧 OTP sent to email:', TEST_EMAIL);
        console.log('⏰ OTP expires at:', signupResult.otpExpiry);
        console.log('🔑 Token received:', signupResult.token ? 'Yes' : 'No');
        
        // Step 2: Simulate OTP verification (you would get this from email)
        console.log('\n2️⃣ Verifying OTP...');
        console.log('📧 Please check your email for the OTP code');
        console.log('💡 In a real scenario, you would enter the OTP from your email');
        
        // For testing purposes, we'll simulate an OTP
        const testOtp = 123456; // This would come from email in real scenario
        
        const verifyResult = await apiCall('POST', '/auth/verify-otp', {
            email: TEST_EMAIL,
            otp: testOtp
        });
        
        console.log('✅ OTP verification successful!');
        console.log('🎉 Account confirmed:', verifyResult.user.isAccountConfirmed);
        console.log('🔑 New token received:', verifyResult.token ? 'Yes' : 'No');
        
        return verifyResult.token;
        
    } catch (error) {
        console.log('❌ OTP Signup test failed:', error.message);
        throw error;
    }
}

// Test OTP Login Flow
async function testOtpLogin(token) {
    console.log('\n🔐 Testing OTP Login Flow...\n');
    
    try {
        // Step 1: Send OTP for login
        console.log('1️⃣ Sending OTP for login...');
        const sendOtpResult = await apiCall('POST', '/auth/login/send-otp', {
            email: TEST_EMAIL
        });
        
        console.log('✅ OTP sent for login!');
        console.log('📧 OTP sent to email:', TEST_EMAIL);
        console.log('⏰ OTP expires at:', sendOtpResult.otpExpiry);
        
        // Step 2: Simulate OTP login
        console.log('\n2️⃣ Logging in with OTP...');
        console.log('📧 Please check your email for the login OTP code');
        
        // For testing purposes, we'll simulate an OTP
        const testOtp = 123456; // This would come from email in real scenario
        
        const loginResult = await apiCall('POST', '/auth/login/otp', {
            email: TEST_EMAIL,
            otp: testOtp,
            loginMethod: 'otp'
        });
        
        console.log('✅ OTP login successful!');
        console.log('👤 User logged in:', loginResult.user.userName);
        console.log('🔑 Login token received:', loginResult.token ? 'Yes' : 'No');
        
        return loginResult.token;
        
    } catch (error) {
        console.log('❌ OTP Login test failed:', error.message);
        throw error;
    }
}

// Test Profile Access
async function testProfileAccess(token) {
    console.log('\n👤 Testing Profile Access...\n');
    
    try {
        const profileResult = await apiCall('GET', '/profile/me', null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Profile access successful!');
        console.log('👤 User profile:', profileResult.data.userName);
        console.log('📧 Email:', profileResult.data.email);
        console.log('🔐 Has password:', profileResult.data.hasPassword);
        console.log('✅ Account confirmed:', profileResult.data.isAccountConfirmed);
        
    } catch (error) {
        console.log('❌ Profile access test failed:', error.message);
        throw error;
    }
}

// Test Resend OTP
async function testResendOtp() {
    console.log('\n🔄 Testing Resend OTP...\n');
    
    try {
        const resendResult = await apiCall('POST', '/auth/resend-otp', {
            email: TEST_EMAIL
        });
        
        console.log('✅ Resend OTP successful!');
        console.log('📧 New OTP sent to email:', TEST_EMAIL);
        console.log('⏰ New OTP expires at:', resendResult.otpExpiry);
        
    } catch (error) {
        console.log('❌ Resend OTP test failed:', error.message);
        throw error;
    }
}

// Main test function
async function runTests() {
    console.log('🧪 Starting OTP Authentication Tests...\n');
    console.log('📧 Test email:', TEST_EMAIL);
    console.log('🌐 Base URL:', BASE_URL);
    
    try {
        // Test OTP Signup
        const signupToken = await testOtpSignup();
        
        // Test Resend OTP
        await testResendOtp();
        
        // Test OTP Login
        const loginToken = await testOtpLogin(signupToken);
        
        // Test Profile Access
        await testProfileAccess(loginToken);
        
        console.log('\n🎉 All tests completed successfully!');
        console.log('\n📋 Test Summary:');
        console.log('✅ OTP Signup - PASSED');
        console.log('✅ OTP Verification - PASSED');
        console.log('✅ Resend OTP - PASSED');
        console.log('✅ OTP Login - PASSED');
        console.log('✅ Profile Access - PASSED');
        
    } catch (error) {
        console.log('\n❌ Tests failed:', error.message);
        process.exit(1);
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    testOtpSignup,
    testOtpLogin,
    testProfileAccess,
    testResendOtp
};
