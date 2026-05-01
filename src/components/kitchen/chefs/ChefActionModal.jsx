import { useState, useEffect } from 'react';
import { X, UserCheck, UserMinus, RefreshCw } from 'lucide-react';

const ChefActionModal = ({ isOpen, onClose, onConfirm, chefName, currentStatus, type }) => {
  const [selectedStatus, setSelectedStatus] = useState('');

  // Define the available statuses for the "Update" mode
  const allStatuses = ['AVAILABLE', 'COOKING', 'ON_BREAK'];
  
  // Filter out the current status (don't show the one they already have)
  const otherStatuses = allStatuses.filter(s => s !== currentStatus);

  useEffect(() => {
    if (isOpen) setSelectedStatus('');
  }, [isOpen]);

  if (!isOpen) return null;

  // --- UI Configuration based on Mode ---
  const config = {
    CHECK_IN: {
      title: "Chef Check-In",
      icon: <UserCheck className="text-green-600" size={24} />,
      color: "bg-green-600",
      btnText: "Confirm Check-In",
      message: `Are you sure you want to clock-in ${chefName} for today's shift?`
    },
    CHECK_OUT: {
      title: "Chef Check-Out",
      icon: <UserMinus className="text-red-600" size={24} />,
      color: "bg-red-600",
      btnText: "Confirm Check-Out",
      message: `Finish shift for ${chefName}? This will record the clock-out time.`
    },
    UPDATE_STATUS: {
      title: "Update Work Status",
      icon: <RefreshCw className="text-orange-600" size={24} />,
      color: "bg-orange-600",
      btnText: "Update Status",
      message: `Select a new status for ${chefName}:`
    }
  };

  const mode = config[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-50 p-2">{mode.icon}</div>
            <h3 className="text-lg font-bold text-gray-900">{mode.title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <p className="mb-6 text-sm font-medium text-gray-500 leading-relaxed">
          {mode.message}
        </p>

        {/* Status Selection (Only for UPDATE_STATUS mode) */}
        {type === 'UPDATE_STATUS' && (
          <div className="mb-8 space-y-3">
            {otherStatuses.map((status) => (
              <label key={status} className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all ${
                selectedStatus === status ? 'border-orange-500 bg-orange-50' : 'border-gray-50 hover:bg-gray-50'
              }`}>
                <span className="text-sm font-bold text-gray-700 capitalize">
                  {status.toLowerCase().replace('_', ' ')}
                </span>
                <input
                  type="radio"
                  name="status"
                  value={status}
                  className="h-4 w-4 accent-orange-600"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
              </label>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 rounded-xl py-3 text-sm font-bold text-gray-400 hover:bg-gray-50">
            Cancel
          </button>
          <button 
            disabled={type === 'UPDATE_STATUS' && !selectedStatus}
            onClick={() => onConfirm(selectedStatus || true)}
            className={`flex-1 rounded-xl py-3 text-sm font-bold text-white shadow-lg shadow-black/10 hover:brightness-110 active:scale-95 transition-all ${mode.color} ${
              (type === 'UPDATE_STATUS' && !selectedStatus) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {mode.btnText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChefActionModal;
