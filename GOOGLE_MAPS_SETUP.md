# Google Maps Integration Setup Guide

## 🗺️ Overview
The Google Maps location picker has been integrated into your donation form (Step 2). Users can click anywhere on the map to pin their pickup location, and the coordinates are automatically saved.

---

## 📦 Installation (Already Done)
```bash
npm install @react-google-maps/api
```

---

## 🔑 Getting Your Google Maps API Key

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### Step 2: Create a New Project (or select existing)
1. Click on the project dropdown at the top
2. Click "New Project"
3. Name it (e.g., "Food-Link")
4. Click "Create"

### Step 3: Enable Google Maps JavaScript API
1. Go to "APIs & Services" → "Library"
2. Search for "Maps JavaScript API"
3. Click on it and press "Enable"

### Step 4: Create API Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key

### Step 5: Restrict Your API Key (Recommended for Production)
1. Click on your API key to edit it
2. Under "Application restrictions":
   - Choose "HTTP referrers (web sites)"
   - Add your domain (e.g., `yourwebsite.com/*`, `localhost:5173/*`)
3. Under "API restrictions":
   - Choose "Restrict key"
   - Select "Maps JavaScript API"
4. Save

---

## ⚙️ Configuration

### Option 1: Direct Configuration (Development)
Edit `src/config/maps.js`:
```javascript
export const GOOGLE_MAPS_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

### Option 2: Environment Variables (Recommended for Production)
1. Create a `.env` file in `/frontend/food-link/`:
```bash
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

2. Update `src/config/maps.js`:
```javascript
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
```

3. Restart your dev server:
```bash
npm run dev
```

---

## 🎨 Component Features

### LocationPicker Component
- **File**: `src/components/LocationPicker.jsx`
- **Features**:
  - Click-to-pin functionality
  - Animated marker drop
  - Real-time coordinate display
  - Matches your existing design system
  - Error handling for API failures
  - Loading states

### Integration in PostDonation Form
- **Location**: Step 2 (Pickup Information)
- **Coordinates stored**: `formData.lat` and `formData.lng`
- **Auto-saved**: Coordinates are automatically updated when user clicks the map
- **Sent to backend**: Included in the donation submission

---

## 🔧 Customization

### Change Default Map Center
Edit `LocationPicker.jsx`:
```javascript
const defaultCenter = {
  lat: 28.6139,  // Your city latitude
  lng: 77.2090   // Your city longitude
};
```

### Change Map Height
Edit `LocationPicker.jsx`:
```javascript
const mapContainerStyle = {
  width: '100%',
  height: '400px',  // Change this
  borderRadius: '1rem'
};
```

### Change Default Zoom Level
Edit `LocationPicker.jsx`:
```javascript
zoom={15}  // Change to 10-20 (higher = more zoomed in)
```

---

## 📱 How It Works

### User Flow:
1. User fills in pickup address in the text field
2. User clicks on the map to pin the exact location
3. A marker drops at the clicked location
4. Coordinates are automatically saved to form state
5. Coordinates display below the map for confirmation
6. When form is submitted, coordinates are sent to backend with other donation data

### Backend Data Structure:
```javascript
{
  // ... other donation fields
  pickupGeo: {
    lat: 28.6139,
    lng: 77.2090
  }
}
```

---

## 🐛 Troubleshooting

### Map not loading?
- ✅ Check if API key is correct
- ✅ Ensure Maps JavaScript API is enabled in Google Cloud Console
- ✅ Check browser console for error messages
- ✅ Restart dev server after adding `.env` file

### "This page can't load Google Maps correctly"
- ✅ API key might be restricted - check HTTP referrer settings
- ✅ Billing might not be enabled (Google requires billing account even for free tier)

### Marker not appearing?
- ✅ Make sure you're clicking inside the map area
- ✅ Check if `formData.lat` and `formData.lng` are being updated

---

## 💰 Pricing
- Google Maps offers **$200 free credit per month**
- Maps JavaScript API: **$7 per 1,000 loads**
- For most small-to-medium apps, you'll stay within the free tier

---

## 🚀 Testing

1. Start your dev server:
```bash
cd /Users/vaibhaavbs/Downloads/Food_Link-main/frontend/food-link
npm run dev
```

2. Navigate to Post Donation form
3. Go to Step 2 (Pickup Information)
4. Click anywhere on the map
5. Verify coordinates appear below the map
6. Submit the form and check backend receives coordinates

---

## 📝 Files Modified/Created

### New Files:
- ✅ `src/components/LocationPicker.jsx` - Map component
- ✅ `src/config/maps.js` - API key configuration
- ✅ `.env.example` - Environment variable template
- ✅ `GOOGLE_MAPS_SETUP.md` - This setup guide

### Modified Files:
- ✅ `src/components/PostDonation.jsx` - Integrated LocationPicker in Step 2
- ✅ `package.json` - Added @react-google-maps/api dependency

---

## ✨ Next Steps

1. **Get your API key** from Google Cloud Console
2. **Add it** to `src/config/maps.js` or `.env` file
3. **Test the map** in your donation form
4. **Deploy** and enjoy! 🎉

Need help? Check the console for error messages or refer to:
- Google Maps API Docs: https://developers.google.com/maps/documentation/javascript
- @react-google-maps/api Docs: https://react-google-maps-api-docs.netlify.app/
