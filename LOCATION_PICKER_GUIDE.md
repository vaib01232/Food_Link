## 📍 Google Maps Location Picker - Visual Guide

### What You'll See in Step 2 of the Donation Form:

```
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Pickup Information                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Pickup Address *                                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📍 [Text area for full address]                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Pin Pickup Location on Map *                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ℹ️ Click anywhere on the map to pin your pickup       │ │
│  │   location. The coordinates will be automatically      │ │
│  │   saved.                                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  │              [GOOGLE MAP INTERACTIVE]                   │ │
│  │                                                         │ │
│  │                     📍 (User clicks here)               │ │
│  │                                                         │ │
│  │                [Marker drops with animation]            │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ✅ Location Selected                         📍         │ │
│  │ Latitude: 28.613900 | Longitude: 77.209000             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Pickup Date] | [Pickup Time]                               │
│  [Expiry Date] | [Expiry Time]                               │
│                                                              │
│  ⚠️ Important Note                                           │
│  Please ensure the food is safe for consumption...          │
│                                                              │
│  [← Previous]                            [Next →]           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design Features

### Color Scheme (Matching Your Existing Design):
- **Primary**: Green 600-700 gradients
- **Borders**: Rounded-xl/2xl (matching your form inputs)
- **Info boxes**: Blue-50 background with blue-400 left border
- **Success indicator**: Green-50 to Green-100 gradient with green border
- **Shadows**: shadow-lg with hover effects

### Interactive Elements:
1. **Map Click** → Marker drops with animation
2. **Marker** → Shows exact pinned location
3. **Info Box** → Blue background, explains how to use
4. **Confirmation Box** → Green background, shows selected coordinates
5. **Loading State** → Spinner with "Loading map..." message
6. **Error State** → Red background with error message

---

## 🔄 Data Flow

```
User clicks map
    ↓
LocationPicker detects click
    ↓
Extracts lat/lng from event
    ↓
Updates local marker position
    ↓
Calls onLocationSelect(lat, lng)
    ↓
PostDonation updates formData.lat & formData.lng
    ↓
Coordinates stored in form state
    ↓
User submits form (Step 3)
    ↓
Backend receives donation data with pickupGeo: { lat, lng }
```

---

## 📋 Props & Customization

### LocationPicker Props:
```javascript
<LocationPicker
  onLocationSelect={(lat, lng) => {}}  // Callback when location selected
  initialLat={28.6139}                 // Pre-populate if editing
  initialLng={77.2090}                 // Pre-populate if editing  
  apiKey="YOUR_API_KEY"                // Your Google Maps API key
/>
```

### Styling Classes Used:
- Container: `border-4 border-gray-200 rounded-2xl overflow-hidden shadow-lg`
- Map: `width: 100%, height: 400px, borderRadius: 1rem`
- Info box: `bg-blue-50 border-l-4 border-blue-400 rounded-xl p-4`
- Success box: `bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl`

---

## 🎯 User Experience

### First-time Users:
1. See blue info box explaining to click the map
2. Click anywhere → marker drops with animation
3. See green confirmation box with exact coordinates
4. Proceed to fill date/time fields

### Editing Existing Donation:
1. Map loads with existing marker at saved coordinates
2. User can click new location to update
3. Marker moves to new position
4. Coordinates automatically update

---

## ⚡ Performance

- **Lazy Loading**: Map only loads when Step 2 is reached
- **Memoized Callbacks**: Prevents unnecessary re-renders
- **Single API Load**: Script loaded once per session
- **Lightweight**: Only loads required Google Maps libraries

---

## 🔒 Security Best Practices

✅ **API Key Restriction**: Restrict to your domain in production
✅ **Environment Variables**: Keep API key out of source control
✅ **HTTPS Only**: Google Maps requires HTTPS in production
✅ **Rate Limiting**: Google has built-in rate limiting

---

## 🌍 Supported Features

✅ Click to pin location
✅ Draggable map
✅ Zoom controls (+ -)
✅ Full-screen mode
✅ Responsive design (mobile-friendly)
✅ Animated marker drop
✅ Real-time coordinate display
✅ Loading states
✅ Error handling
✅ Default center configuration
✅ Initial location support (for editing)

❌ Address geocoding (not included - add if needed)
❌ Current location detection (not included - add if needed)
❌ Multiple markers (not needed for this use case)

---

Ready to use! Just add your Google Maps API key and test it out! 🚀
