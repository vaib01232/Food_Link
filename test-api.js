// Simple test script to verify backend API endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  console.log('Testing Food Link API endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get('http://localhost:3000/');
    console.log('✅ Health check:', healthResponse.data);
    console.log('');

    // Test 2: Register a test donor
    console.log('2. Testing donor registration...');
    const donorData = {
      name: 'Test Donor',
      email: 'testdonor@example.com',
      password: 'password123',
      role: 'donor'
    };
    
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, donorData);
      console.log('✅ Donor registration successful');
      console.log('Token:', registerResponse.data.token ? 'Present' : 'Missing');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message === 'User already exists') {
        console.log('✅ Donor already exists (expected)');
      } else {
        console.log('❌ Registration error:', error.response?.data || error.message);
      }
    }
    console.log('');

    // Test 3: Login as donor
    console.log('3. Testing donor login...');
    const loginData = {
      email: 'testdonor@example.com',
      password: 'password123'
    };
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData);
    console.log('✅ Login successful');
    console.log('User role:', loginResponse.data.user?.role);
    const token = loginResponse.data.token;
    console.log('');

    // Test 4: Get donations (should be empty initially)
    console.log('4. Testing get donations...');
    const donationsResponse = await axios.get(`${API_BASE}/donations`);
    console.log('✅ Get donations successful');
    console.log('Donations count:', donationsResponse.data.length);
    console.log('');

    // Test 5: Create a donation
    console.log('5. Testing create donation...');
    const donationData = {
      title: 'Test Food Donation',
      description: 'Fresh vegetables and fruits',
      quantity: 10,
      pickupAddress: '123 Test Street, Test City',
      pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      expireDateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      pickupGeo: {
        lat: 40.7128,
        lng: -74.0060
      },
      photos: []
    };

    const createResponse = await axios.post(`${API_BASE}/donations`, donationData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Create donation successful');
    console.log('Donation ID:', createResponse.data.donation?._id);
    const donationId = createResponse.data.donation?._id;
    console.log('');

    // Test 6: Get donations again (should have 1 now)
    console.log('6. Testing get donations after creation...');
    const donationsResponse2 = await axios.get(`${API_BASE}/donations`);
    console.log('✅ Get donations successful');
    console.log('Donations count:', donationsResponse2.data.length);
    console.log('');

    // Test 7: Register an NGO user
    console.log('7. Testing NGO registration...');
    const ngoData = {
      name: 'Test NGO',
      email: 'testngo@example.com',
      password: 'password123',
      role: 'ngo'
    };
    
    try {
      const ngoRegisterResponse = await axios.post(`${API_BASE}/auth/register`, ngoData);
      console.log('✅ NGO registration successful');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message === 'User already exists') {
        console.log('✅ NGO already exists (expected)');
      } else {
        console.log('❌ NGO registration error:', error.response?.data || error.message);
      }
    }
    console.log('');

    // Test 8: Login as NGO
    console.log('8. Testing NGO login...');
    const ngoLoginData = {
      email: 'testngo@example.com',
      password: 'password123'
    };
    
    const ngoLoginResponse = await axios.post(`${API_BASE}/auth/login`, ngoLoginData);
    console.log('✅ NGO login successful');
    console.log('User role:', ngoLoginResponse.data.user?.role);
    const ngoToken = ngoLoginResponse.data.token;
    console.log('');

    // Test 9: Claim donation as NGO
    if (donationId) {
      console.log('9. Testing claim donation...');
      const claimResponse = await axios.patch(`${API_BASE}/donations/${donationId}/claim`, {}, {
        headers: { Authorization: `Bearer ${ngoToken}` }
      });
      console.log('✅ Claim donation successful');
      console.log('Donation status:', claimResponse.data.donation?.status);
      console.log('');
    }

    console.log('🎉 All API tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAPI();
