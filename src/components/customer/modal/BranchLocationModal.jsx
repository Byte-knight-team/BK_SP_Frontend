import React from 'react';
import { MapPin, X, ExternalLink } from 'lucide-react';

export default function BranchLocationModal({ branchDetails, onClose }) {
  if (!branchDetails) return null;

  const { name, address, latitude, longitude } = branchDetails;
  const hasCoords = latitude != null && longitude != null;

  const mapSrc = hasCoords
    ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
    : address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(name + ' ' + address)}&z=15&output=embed`
    : null;

  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + (address || ''))}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <MapPin size={16} />
              </span>
              {name || 'Branch Location'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{address || 'Location Map'}</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
          {mapSrc ? (
            <iframe
              title="Branch Location Map"
              width="100%"
              height="100%"
              className="absolute inset-0 border-0"
              loading="lazy"
              allowFullScreen
              src={mapSrc}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
              <MapPin size={36} className="mb-2 opacity-40 text-orange-500" />
              <p className="text-sm font-semibold">Location coordinates unavailable</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
          >
            <ExternalLink size={14} /> Open in Google Maps app
          </a>
          <button
            onClick={onClose}
            type="button"
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
