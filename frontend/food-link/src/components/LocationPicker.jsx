import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, Loader } from 'lucide-react';

const LocationPicker = ({ 
  onLocationSelect, 
  initialLat, 
  initialLng, 
  apiKey 
}) => {
  const [markerPosition, setMarkerPosition] = useState(
    initialLat && initialLng 
      ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) }
      : null
  );

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  });

  // Default center (you can change this to your city)
  const defaultCenter = {
    lat: 28.6139, // New Delhi coordinates - change to your preferred city
    lng: 77.2090
  };

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '1rem'
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
  };

  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    setMarkerPosition({ lat, lng });
    
    // Call parent callback with coordinates
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  }, [onLocationSelect]);

  if (loadError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 rounded-xl p-5">
        <div className="flex gap-3">
          <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800 text-sm mb-1">Map Loading Error</p>
            <p className="text-red-700 text-sm font-medium">
              Failed to load Google Maps. Please check your API key or internet connection.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center">
          <Loader className="w-10 h-10 text-green-600 animate-spin mb-3" />
          <p className="text-green-800 font-bold text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-4">
        <div className="flex gap-3">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm font-medium">
            Click anywhere on the map to pin your pickup location. The coordinates will be automatically saved.
          </p>
        </div>
      </div>

      <div className="border-4 border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:border-green-300 transition-all duration-300">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={markerPosition || defaultCenter}
          zoom={15}
          onClick={onMapClick}
          options={mapOptions}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              animation={window.google?.maps?.Animation?.DROP}
            />
          )}
        </GoogleMap>
      </div>

      {markerPosition && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-green-900 mb-1">📍 Location Selected</p>
              <p className="text-xs text-green-700 font-medium">
                Latitude: {markerPosition.lat.toFixed(6)} | Longitude: {markerPosition.lng.toFixed(6)}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
