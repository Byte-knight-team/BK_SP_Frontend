import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { createAlertAPI } from '../../../apis/kitchen/alerts'

const AlertModal = ({ isOpen, onClose, onAlertSent }) => {
  const [message, setMessage] = useState('')
  const [type, setType] = useState('CRITICAL')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSend = async () => {
    if (!message.trim()) return toast.warning('Please type a message');

    setLoading(true);
    const { error } = await createAlertAPI(message, type);
    setLoading(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success('Broadcast alert sent to Receptionist!');
      onAlertSent(false); // Background refresh
      onClose();
      setMessage('');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-orange-600">
            <AlertTriangle size={20} />
            <h3 className="text-lg font-bold">Broadcast Kitchen Issue</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Severity Select */}
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-400 uppercase">
              Issue Severity
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="CRITICAL">
                Critical (e.g. Oven broken, No gas)
              </option>
              <option value="WARNING">
                Warning (e.g. Ingredient over, Item unavailable)
              </option>
              <option value="INFO">Info (e.g. General delays)</option>
            </select>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-400 uppercase">
              What happened?
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Pineapple is over, cannot make juice anymore..."
              className="h-24 w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleSend}
            // Prevents multiple submissions while the API request is in progress
            // Disable the button if loading is true to prevent duplicate submissions
            disabled={loading}
            className="w-full rounded-xl bg-orange-600 py-3 font-bold text-white shadow-lg transition-all hover:bg-orange-700 disabled:bg-gray-300"
          >
            {loading ? 'Sending...' : 'SEND TO RECEPTIONIST'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlertModal
