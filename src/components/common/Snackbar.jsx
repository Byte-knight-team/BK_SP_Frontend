import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const Snackbar = ({ message, type, onClose, position = 'bottom-center' }) => {
  const icons = {
    success: <CheckCircle className="text-green-500" size={24} />,
    error: <AlertCircle className="text-red-500" size={24} />,
    info: <Info className="text-blue-500" size={24} />,
  }

  const positionClasses = {
    'top-left': 'top-6 left-6 animate-slide-in-left',
    'top-right': 'top-6 right-6 animate-slide-in-right',
    'top-center': 'top-6 left-1/2 -translate-x-1/2 animate-slide-in-top',
    'bottom-left': 'bottom-6 left-6 animate-slide-in-left',
    'bottom-right': 'bottom-6 right-6 animate-slide-in-right',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2 animate-bounce-in',
  }

  return (
    <div
      className={`fixed z-[100] flex min-w-[320px] items-center gap-3 rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-2xl ${positionClasses[position]}`}
    >
      <div className="rounded-full p-1">{icons[type] || icons.info}</div>

      <p className="flex-1 text-sm font-bold text-gray-700">{message}</p>

      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X size={18} />
      </button>

      <div
        className={`animate-progress-shrink absolute bottom-0 left-0 h-1 rounded-b-2xl ${
          type === 'success'
            ? 'bg-green-500'
            : type === 'error'
              ? 'bg-red-500'
              : 'bg-blue-500'
        }`}
      />
    </div>
  )
}

export default Snackbar
