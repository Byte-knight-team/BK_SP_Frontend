import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmStatusModal = ({ coupon, onClose, onConfirm, isLoading }) => {
  const newStatus = coupon.status === 'ACTIVE' ? 'Inactive' : 'Active';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600">
           <AlertTriangle size={28} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Change Status?</h3>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to mark coupon <strong className="text-gray-800 font-mono bg-gray-100 px-1 py-0.5 rounded">{coupon.code}</strong> as <strong className={coupon.status === 'ACTIVE' ? 'text-red-600' : 'text-green-600'}>{newStatus}</strong>?
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl text-white bg-orange-500 hover:bg-orange-600 font-semibold transition-colors disabled:opacity-50 shadow-sm"
          >
            {isLoading ? 'Updating...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmStatusModal;
