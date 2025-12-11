import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, Loader, CheckCircle, Navigation } from 'lucide-react';

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
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [mapCenter, setMapCenter] = useState(
    initialLat && initialLng 
      ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) }
      : { lat: 28.6139, lng: 77.2090 }
  );

  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  });

  const mapContainerStyle = {
    width: '100%',
    height: '450px',
    borderRadius: '1rem'
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
    gestureHandling: 'greedy',
  };

  // Handle marker drag
  const onMarkerDragEnd = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    setMarkerPosition({ lat, lng });
    setIsConfirmed(false);
  }, []);

  // Handle map click
  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    setMarkerPosition({ lat, lng });
    setIsConfirmed(false);
  }, []);

  // Confirm location
  const handleConfirmLocation = () => {
    if (markerPosition && onLocationSelect) {
      onLocationSelect(markerPosition.lat, markerPosition.lng);
      setIsConfirmed(true);
    }
  };

  // Get current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newPosition = { lat, lng };
          
          setMarkerPosition(newPosition);
          setMapCenter(newPosition);
          setIsConfirmed(false);
          
          if (mapRef.current) {
            mapRef.current.panTo(newPosition);
            mapRef.current.setZoom(17);
          }
        },
        () => {
          alert('Unable to get your location. Please ensure location permissions are enabled.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

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
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-4">
        <div className="flex gap-3">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-800 text-sm font-medium">
              Click on the map to pin your pickup location, or use your current location. Drag the pin to adjust the exact pickup point.
            </p>
          </div>
        </div>
      </div>

      {/* Current Location Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          title="Use my current location"
        >
          <Navigation className="w-5 h-5" />
          <span className="text-sm font-bold">Use Current Location</span>
        </button>
      </div>

      {/* Interactive Map */}
      <div className="border-4 border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:border-green-300 transition-all duration-300">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={15}
          onClick={onMapClick}
          options={mapOptions}
          onLoad={(map) => (mapRef.current = map)}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable={true}
              onDragEnd={onMarkerDragEnd}
              options={{
                animation: window.google?.maps?.Animation?.DROP
              }}
            />
          )}
        </GoogleMap>
      </div>

      {/* Coordinates Display & Confirm Button */}
      {markerPosition && (
        <div className="space-y-3">
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

          {/* Confirm Location Button */}
          <button
            type="button"
            onClick={handleConfirmLocation}
            disabled={isConfirmed}
            className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              isConfirmed
                ? 'bg-green-600 text-white cursor-default'
                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:scale-[1.02] shadow-lg hover:shadow-xl'
            }`}
          >
            {isConfirmed ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Location Confirmed
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5" />
                Confirm Location
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
