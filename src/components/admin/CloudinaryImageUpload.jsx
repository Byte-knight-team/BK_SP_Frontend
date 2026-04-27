import React, { useMemo, useState } from 'react';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export default function CloudinaryImageUpload({
  cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  initialValue = null,
  onChange,
  label = 'Upload image',
  className = '',
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImage, setUploadedImage] = useState(initialValue);

  const hasCredentials = useMemo(() => Boolean(cloudName && uploadPreset), [cloudName, uploadPreset]);

  const validateFile = (file) => {
    if (!file) {
      return 'Please select an image file.';
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, or WEBP images are allowed.';
    }

    if (file.size >= MAX_FILE_SIZE_BYTES) {
      return 'Image size must be less than 5MB.';
    }

    return '';
  };

  const uploadToCloudinary = async (file) => {
    if (!hasCredentials) {
      throw new Error('Cloudinary cloud name or upload preset is missing.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error?.message || 'Upload failed. Please try again.');
    }

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      event.target.value = '';
      return;
    }

    setError('');
    setUploading(true);

    try {
      const uploadedData = await uploadToCloudinary(file);
      setUploadedImage(uploadedData);

      if (typeof onChange === 'function') {
        onChange(uploadedData);
      }
    } catch (uploadError) {
      setError(uploadError.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-orange-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-orange-600 hover:file:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-70"
      />

      <p className="mt-2 text-xs text-gray-500">Accepted: JPG, PNG, WEBP. Max size: 5MB.</p>

      {!hasCredentials && (
        <p className="mt-2 text-xs font-medium text-red-600">
          Missing Cloudinary configuration. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.
        </p>
      )}

      {uploading && <p className="mt-2 text-sm text-orange-600">Uploading image...</p>}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {uploadedImage?.secure_url && (
        <div className="mt-4 rounded-xl border border-gray-200 p-3">
          <img
            src={uploadedImage.secure_url}
            alt="Uploaded preview"
            className="h-40 w-full rounded-lg object-cover"
          />
          <div className="mt-2 text-xs text-gray-600">
            <div>
              <span className="font-semibold">secure_url:</span> {uploadedImage.secure_url}
            </div>
            <div>
              <span className="font-semibold">public_id:</span> {uploadedImage.public_id}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}