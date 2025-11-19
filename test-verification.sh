#!/bin/bash

# Email Verification Test Script
# This script helps verify that the email verification system is working

echo "=================================================="
echo "Food Link - Email Verification Test"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "Checking if backend is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running${NC}"
    echo "Please start backend: cd backend && npm run dev"
    exit 1
fi

# Check if frontend is running
echo "Checking if frontend is running..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend is not running${NC}"
    echo "Please start frontend: cd frontend/food-link && npm run dev"
    exit 1
fi

echo ""
echo "=================================================="
echo "Testing Registration Endpoint"
echo "=================================================="

# Generate random email
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"
TEST_NAME="Test User ${TIMESTAMP}"

echo "Registering user: $TEST_EMAIL"

# Register user
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"Test1234\",
    \"role\": \"donor\",
    \"phoneNumber\": \"+1234567890\"
  }")

echo "Response: $RESPONSE"

# Check if registration was successful
if echo "$RESPONSE" | grep -q "requiresVerification"; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    echo -e "${YELLOW}→ Verification email would be sent in production${NC}"
else
    echo -e "${RED}✗ Registration failed${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""
echo "=================================================="
echo "Testing Login (Unverified User)"
echo "=================================================="

# Try to login with unverified user
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"Test1234\"
  }")

echo "Response: $LOGIN_RESPONSE"

# Check if login is blocked
if echo "$LOGIN_RESPONSE" | grep -q "requiresVerification"; then
    echo -e "${GREEN}✓ Unverified user correctly blocked from login${NC}"
else
    echo -e "${RED}✗ Unverified user was able to login (should be blocked)${NC}"
    exit 1
fi

echo ""
echo "=================================================="
echo "Test Summary"
echo "=================================================="
echo -e "${GREEN}✓ Backend API is responding${NC}"
echo -e "${GREEN}✓ Frontend is accessible${NC}"
echo -e "${GREEN}✓ Registration creates unverified users${NC}"
echo -e "${GREEN}✓ Unverified users blocked from login${NC}"
echo ""
echo -e "${YELLOW}Manual testing required:${NC}"
echo "1. Go to: http://localhost:5173/register"
echo "2. Register a new user"
echo "3. Check backend console for verification URL"
echo "4. Copy and paste URL in browser"
echo "5. Should see 'Email Verified!' page"
echo "6. Should auto-login and redirect to dashboard"
echo ""
echo "=================================================="
echo "For detailed instructions, see:"
echo "  - QUICK_START_VERIFICATION.md"
echo "  - EMAIL_VERIFICATION_SETUP.md"
echo "=================================================="
