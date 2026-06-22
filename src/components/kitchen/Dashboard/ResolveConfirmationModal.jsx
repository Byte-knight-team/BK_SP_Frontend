import { X, CheckCircle } from "lucide-react";
import { useState } from "react";

const ResolveConfirmationModal = ({ isOpen, onClose, onConfirm, alertMessage }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-2 text-green-600">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Resolve Issue?</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-4">
          <p className="text-sm text-gray-500 leading-relaxed">
            Are you sure this operational issue has been fixed? This will remove the alert from the dashboard.
          </p>
          
          <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Issue Message</p>
            <p className="text-sm font-medium text-gray-700 mt-1 italic">"{alertMessage}"</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-gray-100 py-4 text-sm font-bold text-gray-400 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={loading}
            className="flex-1 rounded-2xl bg-green-500 py-4 text-sm font-bold text-white shadow-lg shadow-green-200 hover:bg-green-600 transition-all disabled:bg-gray-300"
          >
            {loading ? "Resolving..." : "Yes, it's Fixed"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResolveConfirmationModal;
