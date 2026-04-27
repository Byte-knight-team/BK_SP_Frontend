import { useState } from "react";
import { X, AlertCircle } from "lucide-react";

const HoldOrderModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-2 text-red-500">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Hold Order</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-500 leading-relaxed">
          Please provide a reason for putting this order on hold. This will be visible to the kitchen staff.
        </p>

        <div className="mt-6">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Hold Reason</label>
          <textarea
            className="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
            rows="4"
            placeholder="e.g., Oven is broken, Out of ingredients..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-gray-100 py-4 text-sm font-bold text-gray-400 transition-all hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            //Executes the confirmation logic with the reason, then clears the input for the next use.
            onClick={() => { onConfirm(reason); setReason(""); }}
            disabled={!reason.trim()}
            className="flex-1 rounded-2xl bg-red-500 py-4 text-sm font-bold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-600 disabled:bg-gray-200 disabled:shadow-none"
          >
            Confirm Hold
          </button>
        </div>
      </div>
    </div>
  );
};

export default HoldOrderModal;
