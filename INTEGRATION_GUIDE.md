# Food Link - Backend Frontend Integration

## Overview
This document outlines the complete integration between the Food Link backend API and frontend React application, ensuring seamless communication and proper error handling.

## Backend API Endpoints

### Authentication Routes (`/api/auth`)
- **POST** `/register` - Register new user (donor or NGO)
- **POST** `/login` - User login

### Donation Routes (`/api/donations`)
- **POST** `/` - Create new donation (requires donor authentication)
- **GET** `/` - Get all available donations
- **PATCH** `/:id/claim` - Claim a donation (requires NGO authentication)

## Frontend Components Integration

### 1. Authentication Flow
- **LoginPage.jsx**: Handles user login with proper error handling
- **RegisterPage.jsx**: Handles user registration with validation
- Both components store JWT tokens in localStorage and set axios default headers

### 2. Donation Management
- **PostDonation.jsx**: Creates new donations (donor only)
- **GetDonation.jsx**: Displays and allows claiming of donations (NGO only)

### 3. API Configuration
- **config/api.js**: Centralized API endpoint configuration
- All components use this configuration for consistent API calls

## Key Integration Features

### Error Handling
- Comprehensive error handling in all API calls
- User-friendly error messages displayed in UI
- Proper loading states during API operations

### Authentication
- JWT token-based authentication
- Automatic token storage and header management
- Role-based access control (donor vs NGO)

### Data Validation
- Frontend form validation
- Backend request validation using express-validator
- Proper data type conversion (strings to numbers, dates)

## API Request/Response Examples

### Register User
```javascript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "donor"
}

Response:
{
  "message": "User registered successfully",
  "token": "jwt_token_here"
}
```

### Create Donation
```javascript
POST /api/donations
Headers: { Authorization: "Bearer jwt_token" }
{
  "title": "Fresh Vegetables",
  "description": "Organic vegetables from local farm",
  "quantity": 20,
  "pickupAddress": "123 Main St, City",
  "pickupDateTime": "2024-01-15T10:00:00Z",
  "expireDateTime": "2024-01-16T10:00:00Z",
  "pickupGeo": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "photos": []
}

Response:
{
  "message": "Donation created successfully",
  "donation": { ... }
}
```

### Claim Donation
```javascript
PATCH /api/donations/:id/claim
Headers: { Authorization: "Bearer jwt_token" }

Response:
{
  "message": "Donation claimed successfully",
  "donation": { ... }
}
```

## Testing the Integration

### Manual Testing Steps
1. Start the backend server: `cd backend && npm run dev`
2. Start the frontend: `cd frontend/food-link && npm run dev`
3. Test the complete flow:
   - Register as a donor
   - Login as donor
   - Post a donation
   - Register as an NGO
   - Login as NGO
   - View and claim donations

### Automated Testing
Run the test script to verify all API endpoints:
```bash
cd backend
npm install axios
node ../test-api.js
```

## Fixed Issues

### Backend Issues Fixed
1. Removed duplicate `express.json()` middleware
2. Added role validation in registration route
3. Improved error handling in controllers

### Frontend Issues Fixed
1. Added missing imports (`useEffect`, `axios`) in GetDonation.jsx
2. Fixed HTTP method from PUT to PATCH for claiming donations
3. Removed hardcoded data from App.jsx
4. Added proper error handling and loading states
5. Centralized API configuration
6. Fixed data type conversions (quantity as number, proper date handling)

### Integration Issues Fixed
1. Consistent error message handling across components
2. Proper token management and authentication flow
3. Real-time UI updates after API operations
4. Proper status management for donation claims

## Environment Setup

### Backend Dependencies
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- morgan
- express-validator
- dotenv

### Frontend Dependencies
- react
- axios
- lucide-react
- tailwindcss

## Security Considerations
- JWT tokens expire after 1 day
- Passwords are hashed using bcrypt
- CORS configured for frontend origin
- Input validation on both frontend and backend
- Role-based access control implemented

## Future Enhancements
- Add refresh token mechanism
- Implement file upload for donation photos
- Add real-time notifications
- Implement donation status tracking
- Add user profile management
- Implement search and filtering for donations
