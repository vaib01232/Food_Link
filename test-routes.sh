#!/bin/bash
BASE_URL="https://food-link-1h58.onrender.com"

echo "============================================"
echo "FOOD LINK BACKEND ROUTE TESTING"
echo "Base URL: $BASE_URL"
echo "============================================"

# Test 1: Root endpoint
echo -e "\n[1] GET / - Health Check"
curl -s "$BASE_URL/" | jq .

# Test 2: Register - missing fields
echo -e "\n[2] POST /api/auth/register - Missing fields (negative test)"
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .

# Test 3: Register - invalid email
echo -e "\n[3] POST /api/auth/register - Invalid email (negative test)"
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"invalid","password":"Test1234","role":"donor"}' | jq .

# Test 4: Register - weak password
echo -e "\n[4] POST /api/auth/register - Weak password (negative test)"
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123","role":"donor"}' | jq .

# Test 5: Login - missing fields
echo -e "\n[5] POST /api/auth/login - Missing fields (negative test)"
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .

# Test 6: Login - invalid credentials
echo -e "\n[6] POST /api/auth/login - Invalid credentials (negative test)"
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@test.com","password":"Test1234"}' | jq .

# Test 7: Verify email - no token
echo -e "\n[7] GET /api/auth/verify-email - No token (negative test)"
curl -s "$BASE_URL/api/auth/verify-email" | jq .

# Test 8: Verify email - invalid token
echo -e "\n[8] GET /api/auth/verify-email - Invalid token (negative test)"
curl -s "$BASE_URL/api/auth/verify-email?token=invalidtoken123" | jq .

# Test 9: Resend verification - no email
echo -e "\n[9] POST /api/auth/resend-verification - No email (negative test)"
curl -s -X POST "$BASE_URL/api/auth/resend-verification" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .

# Test 10: Forgot password - no email
echo -e "\n[10] POST /api/auth/forgot-password - No email (negative test)"
curl -s -X POST "$BASE_URL/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .

# Test 11: Reset password - no token
echo -e "\n[11] POST /api/auth/reset-password - No token (negative test)"
curl -s -X POST "$BASE_URL/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"password":"NewPass123"}' | jq .

# Test 12: Update phone - no auth
echo -e "\n[12] POST /api/auth/update-phone - No auth (negative test)"
curl -s -X POST "$BASE_URL/api/auth/update-phone" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+1234567890"}' | jq .

# Test 13: Verify phone - no auth
echo -e "\n[13] POST /api/auth/verify-phone - No auth (negative test)"
curl -s -X POST "$BASE_URL/api/auth/verify-phone" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+1234567890"}' | jq .

# Test 14: Get donations - public endpoint
echo -e "\n[14] GET /api/donations - Public list (should work)"
curl -s "$BASE_URL/api/donations" | jq '{success, pagination, count: (.data | length)}'

# Test 15: Get single donation - invalid ID
echo -e "\n[15] GET /api/donations/:id - Invalid ID (negative test)"
curl -s "$BASE_URL/api/donations/invalid123" | jq .

# Test 16: Create donation - no auth
echo -e "\n[16] POST /api/donations - No auth (negative test)"
curl -s -X POST "$BASE_URL/api/donations" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}' | jq .

# Test 17: Claim donation - no auth
echo -e "\n[17] PATCH /api/donations/:id/claim - No auth (negative test)"
curl -s -X PATCH "$BASE_URL/api/donations/507f1f77bcf86cd799439011/claim" \
  -H "Content-Type: application/json" | jq .

# Test 18: Get claimed donations - no auth
echo -e "\n[18] GET /api/donations/claimed - No auth (negative test)"
curl -s "$BASE_URL/api/donations/claimed" | jq .

# Test 19: Notifications - no auth
echo -e "\n[19] GET /api/notifications - No auth (negative test)"
curl -s "$BASE_URL/api/notifications" | jq .

# Test 20: Unread count - no auth
echo -e "\n[20] GET /api/notifications/unread-count - No auth (negative test)"
curl -s "$BASE_URL/api/notifications/unread-count" | jq .

# Test 21: Admin cleanup status - no auth
echo -e "\n[21] GET /api/admin/cleanup/status - No auth (negative test)"
curl -s "$BASE_URL/api/admin/cleanup/status" | jq .

# Test 22: Upload image - no auth
echo -e "\n[22] POST /api/uploads/image - No auth (negative test)"
curl -s -X POST "$BASE_URL/api/uploads/image" | jq .

# Test 23: Contact form - no data
echo -e "\n[23] POST /api/contact - No data (negative test)"
curl -s -X POST "$BASE_URL/api/contact" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .

# Test 24: Contact form - invalid email
echo -e "\n[24] POST /api/contact - Invalid email (negative test)"
curl -s -X POST "$BASE_URL/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"invalid","message":"Hello"}' | jq .

echo -e "\n============================================"
echo "NEGATIVE TESTS COMPLETE"
echo "============================================"
