import { X } from 'lucide-react'

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  maxWidth = 'max-w-md',
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className={`w-full ${maxWidth} rounded-4xl border border-gray-100 bg-white p-8 shadow-2xl`}
      >
        <div className="mb-6 flex items-start justify-between">
          {Icon && (
            <div className="rounded-2xl bg-orange-100 p-3 text-orange-600 shadow-sm shadow-orange-100">
              <Icon size={24} />
            </div>
          )}
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 transition-colors hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {(title || description) && (
          <div className="mb-6 text-left">
            {title && (
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-400">{description}</p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  )
}
