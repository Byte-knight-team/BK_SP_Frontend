import React, { useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCouponAPI, updateCouponStatusAPI } from '../../../../apis/admin/coupon';
import { showSuccessToast, showErrorToast } from '../../../../utils/toast';

const EditCouponModal = ({ coupon, onClose, isExpired }) => {
    const queryClient = useQueryClient();
  const tzoffset = new Date().getTimezoneOffset() * 60000;
  const currentDateTime = new Date(Date.now() - tzoffset).toISOString().slice(0, 16);
  const [formData, setFormData] = useState({
    description: coupon.description || '',
    discountValue: coupon.discountValue,
    expirationDate: coupon.endDate ? coupon.endDate.slice(0, 16) : '',
    usageLimit: coupon.usageLimit || '',
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      await updateCouponAPI(coupon.id, data);
      if (isExpired || coupon.status !== 'ACTIVE') {
        await updateCouponStatusAPI(coupon.id, 'ACTIVE');
      }
    },
    onSuccess: () => {
      showSuccessToast('Coupon updated successfully');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      onClose();
    },
    onError: (error) => {
      showErrorToast(error.message || 'Failed to update coupon');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      description: formData.description,
      discountValue: parseFloat(formData.discountValue),
      expirationDate: formData.expirationDate,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Pencil size={18} className="text-orange-500" />
            Edit Coupon: <span className="text-orange-600 font-mono bg-orange-50 px-2 py-0.5 rounded">{coupon.code}</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              required
              disabled={isExpired}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              rows="2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Discount Value</label>
            <input
              type="number"
              step="0.01"
              required
              disabled={isExpired}
              value={formData.discountValue}
              onChange={e => setFormData({...formData, discountValue: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Expiration Date & Time</label>
            <input type="datetime-local" min={currentDateTime} required
              value={formData.expirationDate}
              onChange={e => setFormData({...formData, expirationDate: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Usage Limit</label>
            <input
              type="number"
              disabled={isExpired}
              placeholder="Leave empty for unlimited"
              value={formData.usageLimit}
              onChange={e => setFormData({...formData, usageLimit: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">Number of times this coupon can be used.</p>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="px-4 py-2 rounded-xl text-white bg-orange-500 hover:bg-orange-600 font-medium transition-colors disabled:opacity-50"
            >
              {mutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCouponModal;




