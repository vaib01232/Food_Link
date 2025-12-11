#!/usr/bin/env node
/**
 * Test script for SendGrid email service
 * Run with: node test-email.js
 */

require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testEmailService() {
  console.log('=== SendGrid Email Service Test ===\n');
  
  console.log('Configuration:');
  console.log('  SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET (' + process.env.SENDGRID_API_KEY.substring(0, 10) + '...)' : 'NOT SET');
  console.log('  SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || 'NOT SET');
  console.log('  SENDGRID_SANDBOX_MODE:', process.env.SENDGRID_SANDBOX_MODE || 'false');
  console.log('');

  const testEmail = process.argv[2] || 'test@example.com';
  console.log('Test recipient:', testEmail);
  console.log('');

  try {
    // Test 1: Verification Email
    console.log('Test 1: Sending verification email...');
    const verifyResult = await emailService.sendVerificationEmail(testEmail, 'Test User', 'test-verification-token');
    console.log('  ✅ Success:', verifyResult.messageId);
    console.log('');

    // Test 2: Password Reset Email
    console.log('Test 2: Sending password reset email...');
    const resetResult = await emailService.sendPasswordResetEmail(testEmail, 'Test User', 'test-reset-token');
    console.log('  ✅ Success:', resetResult.messageId);
    console.log('');

    // Test 3: Donation Claim Email
    console.log('Test 3: Sending donation claim email...');
    const claimResult = await emailService.sendDonationClaimEmail(testEmail, 'Test NGO', {
      donationId: 'DON-123456',
      donationTitle: 'Fresh Vegetables',
      donorName: 'John Donor',
      donorEmail: 'donor@example.com',
      donorPhone: '+1234567890',
      donorAddress: '123 Main St, City',
      pickupDateTime: new Date().toISOString(),
      pickupGeo: { lat: 40.7128, lng: -74.0060 }
    });
    console.log('  ✅ Success:', claimResult.messageId);
    console.log('');

    // Test 4: Contact Email
    console.log('Test 4: Sending contact form email...');
    const contactResult = await emailService.sendContactEmail('Test User', testEmail, 'This is a test message from the contact form.');
    console.log('  ✅ Success:', contactResult.messageId);
    console.log('');

    console.log('=== All tests passed! ===');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('  Status:', error.response.statusCode);
      console.error('  Body:', JSON.stringify(error.response.body, null, 2));
    }
    process.exit(1);
  }
}

testEmailService();
