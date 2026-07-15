import { useState, useCallback, useRef, useEffect } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { X, Search, MapPin, Crosshair, Check } from 'lucide-react';
import './LocationPickerModal.css';

// ── Colombo default center ──
const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 };
const DEFAULT_ZOOM = 14;

/**
 * Autocomplete search bar that sits on top of the map.
 * Uses the Places API to let users type a location and jump the map.
 */
function PlacesSearch({ onPlaceSelect }) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    // Initialize the Autocomplete widget
    autocompleteRef.current = new placesLib.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'lk' }, // Restrict to Sri Lanka
      fields: ['geometry', 'formatted_address', 'name'],
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (!place?.geometry?.location) return;

      const loc = place.geometry.location;
      const newCenter = { lat: loc.lat(), lng: loc.lng() };

      map?.panTo(newCenter);
      map?.setZoom(17);

      onPlaceSelect({
        lat: newCenter.lat,
        lng: newCenter.lng,
        address: place.formatted_address || place.name || '',
      });
    });

    // Cleanup function: Google Maps leaves .pac-container elements in the body
    // when the input is destroyed. We need to manually remove them.
    return () => {
      const pacContainers = document.querySelectorAll('.pac-container');
      pacContainers.forEach((container) => container.remove());
    };
  }, [placesLib, map, onPlaceSelect]);

  return (
    <div className="location-picker-search">
      <Search size={16} className="location-picker-search-icon" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search a place..."
        className="location-picker-search-input"
      />
    </div>
  );
}

/**
 * "Locate Me" Button
 * Must be rendered inside <APIProvider> to use `useMap()`.
 */
function LocateMeButton() {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation || !map) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCenter = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.panTo(newCenter);
        map.setZoom(17);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [map]);

  return (
    <button
      type="button"
      onClick={handleLocateMe}
      className="location-picker-locate-btn"
      disabled={isLocating}
    >
      <Crosshair size={18} className={isLocating ? 'animate-spin' : ''} />
    </button>
  );
}

/**
 * Full-screen modal with a Google Map + center-locked pin.
 * The user drags the map under the pin; on "Confirm", the center coordinates are returned.
 *
 * Props:
 *   isOpen        – controls visibility
 *   onClose       – called when the modal is dismissed
 *   onConfirm     – called with { lat, lng, address } when the user confirms
 *   initialCenter – optional { lat, lng } to start the map at
 */
export default function LocationPickerModal({ isOpen, onClose, onConfirm, initialCenter }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_CUSTOMER_API_KEY;
  const [center, setCenter] = useState(initialCenter || DEFAULT_CENTER);
  const [selectedAddress, setSelectedAddress] = useState('');

  // ── Handle map camera changes (user dragging) ──
  const handleCameraChanged = useCallback((ev) => {
    const c = ev.detail.center;
    setCenter({ lat: c.lat, lng: c.lng });
  }, []);

  // ── When search selects a place ──
  const handlePlaceSelect = useCallback((place) => {
    setCenter({ lat: place.lat, lng: place.lng });
    setSelectedAddress(place.address);
  }, []);

  // ── Confirm button ──
  const handleConfirm = useCallback(() => {
    onConfirm({
      lat: center.lat,
      lng: center.lng,
      address: selectedAddress,
    });
  }, [center, selectedAddress, onConfirm]);

  // ── Lock body scroll when modal is open ──
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !apiKey) return null;

  return (
    <div className="location-picker-overlay" onClick={onClose}>
      <div className="location-picker-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="location-picker-header">
          <button type="button" onClick={onClose} className="location-picker-close-btn">
            <X size={20} />
          </button>
          <h3 className="location-picker-title">Select Delivery Location</h3>
          <div style={{ width: 36 }} /> {/* Spacer for centering */}
        </div>

        {/* Map Container */}
        <div className="location-picker-map-wrapper">
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={center}
              defaultZoom={DEFAULT_ZOOM}
              gestureHandling="greedy"
              disableDefaultUI={true}
              zoomControl={true}
              mapId="delivery-location-picker"
              onCameraChanged={handleCameraChanged}
              style={{ width: '100%', height: '100%' }}
            />

            {/* Search bar floating over map */}
            <PlacesSearch onPlaceSelect={handlePlaceSelect} />
            {/* "Locate Me" GPS button (now inside APIProvider so it works!) */}
            <LocateMeButton />
          </APIProvider>

          {/* Center pin (fixed in the middle of the map) */}
          <div className="location-picker-center-pin">
            <MapPin size={36} strokeWidth={2.5} color="#EA580C" fill="#FFF7F2" />
          </div>
        </div>

        {/* Footer with Confirm */}
        <div className="location-picker-footer">
          {selectedAddress && (
            <p className="location-picker-address-preview">
              <MapPin size={14} /> {selectedAddress}
            </p>
          )}
          <button type="button" onClick={handleConfirm} className="location-picker-confirm-btn">
            <Check size={18} />
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
