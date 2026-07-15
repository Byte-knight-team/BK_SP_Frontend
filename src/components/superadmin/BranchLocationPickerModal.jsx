// src/components/superadmin/BranchLocationPickerModal.jsx

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  APIProvider,
  Map,
} from "@vis.gl/react-google-maps";

import {
  X,
  MapPin,
  Check,
  AlertCircle,
} from "lucide-react";

/*
 * Reuse the existing location picker styles without
 * modifying the teammate's customer component.
 */
import "../customer/LocationPickerModal.css";

const DEFAULT_CENTER = {
  lat: 6.9271,
  lng: 79.8612,
};

const DEFAULT_ZOOM = 14;

/**
 * SUPER_ADMIN branch location picker.
 *
 * Purpose:
 * - Shows a draggable Google Map.
 * - Keeps a fixed pin in the middle.
 * - Returns only latitude and longitude.
 *
 * It does not:
 * - search addresses;
 * - convert coordinates into an address;
 * - access the browser's current location;
 * - modify the manually entered branch address.
 */
export default function BranchLocationPickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialCenter,
}) {
  const apiKey =
    import.meta.env
      .VITE_GOOGLE_MAPS_CUSTOMER_API_KEY;

  const [center, setCenter] = useState(
    getSafeCenter(initialCenter)
  );

  /*
   * Reset the map center every time the modal opens.
   *
   * Create Branch:
   * - Uses the default Colombo location.
   *
   * Edit Branch:
   * - Uses the branch's saved latitude and longitude.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setCenter(getSafeCenter(initialCenter));
  }, [
    isOpen,
    initialCenter?.lat,
    initialCenter?.lng,
  ]);

  /*
   * Prevent the page behind the modal from scrolling.
   */
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  /*
   * Save the current center whenever the user moves
   * or zooms the map.
   */
  const handleCameraChanged =
    useCallback((event) => {
      const cameraCenter =
        event?.detail?.center;

      if (!isValidCoordinates(cameraCenter)) {
        return;
      }

      setCenter({
        lat: Number(cameraCenter.lat),
        lng: Number(cameraCenter.lng),
      });
    }, []);

  /*
   * Return only the map-selected coordinates.
   */
  const handleConfirm = useCallback(() => {
    if (!isValidCoordinates(center)) {
      return;
    }

    onConfirm({
      lat: Number(center.lat),
      lng: Number(center.lng),
    });
  }, [center, onConfirm]);

  if (!isOpen) {
    return null;
  }

  /*
   * Show a readable message instead of silently hiding
   * the picker when the Maps API key is missing.
   */
  if (!apiKey) {
    return (
      <div
        className="location-picker-overlay"
        onClick={onClose}
      >
        <div
          className="location-picker-modal"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <div className="location-picker-header">
            <button
              type="button"
              onClick={onClose}
              className="location-picker-close-btn"
              aria-label="Close location picker"
            >
              <X size={20} />
            </button>

            <h3 className="location-picker-title">
              Select Branch Location
            </h3>

            <div style={{ width: 36 }} />
          </div>

          <div className="flex min-h-[260px] items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertCircle size={24} />
              </div>

              <h4 className="mt-4 font-bold text-gray-900">
                Google Maps is not configured
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Add the Google Maps API key to the
                frontend environment configuration and
                restart the frontend server.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="location-picker-overlay"
      onClick={onClose}
    >
      <div
        className="location-picker-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* Header */}
        <div className="location-picker-header">
          <button
            type="button"
            onClick={onClose}
            className="location-picker-close-btn"
            aria-label="Close location picker"
          >
            <X size={20} />
          </button>

          <h3 className="location-picker-title">
            Select Branch Location
          </h3>

          <div style={{ width: 36 }} />
        </div>

        {/* Map */}
        <div className="location-picker-map-wrapper">
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={center}
              defaultZoom={DEFAULT_ZOOM}
              gestureHandling="greedy"
              disableDefaultUI
              zoomControl
              mapId="superadmin-branch-location-picker"
              onCameraChanged={
                handleCameraChanged
              }
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </APIProvider>

          {/* Fixed center pin */}
          <div className="location-picker-center-pin">
            <MapPin
              size={36}
              strokeWidth={2.5}
              color="#EA580C"
              fill="#FFF7F2"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="location-picker-footer">
          <div className="location-picker-address-preview">
            <MapPin size={14} />

            <span>
              Latitude:{" "}
              {Number(center.lat).toFixed(6)}
              {" · "}
              Longitude:{" "}
              {Number(center.lng).toFixed(6)}
            </span>
          </div>

          <p
            style={{
              margin: "0 0 10px",
              color: "#6b7280",
              fontSize: "12px",
              lineHeight: 1.5,
            }}
          >
            Move the map until the exact branch
            position is under the center pin.
          </p>

          <button
            type="button"
            onClick={handleConfirm}
            className="location-picker-confirm-btn"
          >
            <Check size={18} />
            Confirm Branch Location
          </button>
        </div>
      </div>
    </div>
  );
}

function getSafeCenter(initialCenter) {
  if (isValidCoordinates(initialCenter)) {
    return {
      lat: Number(initialCenter.lat),
      lng: Number(initialCenter.lng),
    };
  }

  return DEFAULT_CENTER;
}

function isValidCoordinates(location) {
  if (!location) {
    return false;
  }

  const latitude = Number(location.lat);
  const longitude = Number(location.lng);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}