import { useState } from 'react'
import { ImagePlus, X, Loader2 } from 'lucide-react'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

const CLOUD_NAME    = import.meta.env.VITE_KITCHEN_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_KITCHEN_CLOUDINARY_UPLOAD_PRESET

/*
  CloudinaryImageUpload — kitchen-scoped image picker.

  Props:
    value     — current image URL string (controlled)
    onChange  — called with the new secure_url string after upload, or '' after clear
*/
const CloudinaryImageUpload = ({ value = '', onChange }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''

    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, or WEBP images are allowed.')
      return
    }
    if (file.size >= MAX_BYTES) {
      setError('Image must be under 5 MB.')
      return
    }

    setError('')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('upload_preset', UPLOAD_PRESET)

      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error?.message || 'Upload failed.')

      onChange?.(data.secure_url)
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">

      {/* Preview — shown when a URL exists */}
      {value ? (
        <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-gray-100">
          <img src={value} alt="Item preview" className="h-full w-full object-cover" />
          {/* Clear button */}
          <button
            type="button"
            onClick={() => { setError(''); onChange?.('') }}
            className="absolute top-2 right-2 flex items-center justify-center rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-colors"
            title="Remove image"
          >
            <X size={14} />
          </button>
          {/* Replace label */}
          <label className="absolute bottom-2 right-2 cursor-pointer rounded-xl bg-black/50 px-3 py-1.5 text-xs font-bold text-white hover:bg-black/70 transition-colors">
            {uploading ? <Loader2 size={13} className="animate-spin" /> : 'Change'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        /* Upload picker — shown when no image yet */
        <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-6 transition-colors ${
          uploading
            ? 'border-orange-200 bg-orange-50/50 cursor-not-allowed'
            : 'border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/40'
        }`}>
          {uploading ? (
            <>
              <Loader2 size={22} className="text-orange-400 animate-spin" />
              <span className="text-xs font-semibold text-orange-500">Uploading…</span>
            </>
          ) : (
            <>
              <ImagePlus size={22} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-500">Click to upload image</span>
              <span className="text-[10px] text-gray-400">JPG, PNG or WEBP · max 5 MB</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}

      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

    </div>
  )
}

export default CloudinaryImageUpload
