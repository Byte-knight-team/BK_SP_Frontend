import React, { useMemo, useState } from 'react';
import { CalendarDays, CircleDot, Sparkles, AlertTriangle, Settings2 } from 'lucide-react';
import { createCouponAPI } from '../../apis/admin/coupon';

const initialFormState = {
  couponCode: '',
  description: '',
  startDate: '',
  expirationDate: '',
  discountType: '',
  discountValue: '',
  usageLimit: '100',
  maxDiscount: '',
  minOrderAmount: '',
};

const codeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const createCouponCode = (length = 10) => {
  let nextCode = '';

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * codeAlphabet.length);
    nextCode += codeAlphabet[randomIndex];
  }

  return nextCode;
};

// Admin page for creating and configuring coupon campaigns.
export default function CouponsPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'warning' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreateCoupon = useMemo(() => {
    return (
      formData.couponCode.trim().length > 0
      && formData.startDate.trim().length > 0
      && formData.expirationDate.trim().length > 0
      && formData.discountType.trim().length > 0
      && formData.discountValue.toString().trim().length > 0
    );
  }, [formData]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((currentState) => ({
      ...currentState,
      [name]: value,
    }));
  };

  const handleGenerateCode = () => {
    setFormData((currentState) => ({
      ...currentState,
      couponCode: createCouponCode(),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canCreateCoupon) return;

    try {
      setIsSubmitting(true);
      const payload = {
        code: formData.couponCode,
        description: formData.description,
        discountType: formData.discountType === 'percentage' ? 'PERCENT' : 'FIXED',
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        startDate: formData.startDate,
        expirationDate: formData.expirationDate,
        usageLimit: formData.usageLimit === 'unlimited' ? null : parseInt(formData.usageLimit),
      };

      await createCouponAPI(payload);
      
      setAlertModal({
        isOpen: true,
        title: 'Success',
        message: 'Coupon has been created successfully.',
        type: 'success',
      });
      setFormData(initialFormState);
    } catch (error) {
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: error.message || 'Failed to create coupon',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] font-sans px-10 pb-10">
      <div className="mb-8 mt-4 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
          <Settings2 size={22} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Create New Coupon</h3>
          <p className="mt-1 text-sm text-gray-500">Fill in the details below to create a new coupon</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
            <CircleDot size={16} className="text-orange-500" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Basic Information</h2>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Coupon Code</label>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <input
                type="text"
                name="couponCode"
                value={formData.couponCode}
                onChange={updateField}
                placeholder="Enter Coupon Code"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
              />
              <button
                type="button"
                onClick={handleGenerateCode}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 text-sm font-semibold hover:bg-orange-100 transition-colors"
              >
                <Sparkles size={16} />
                Generate Code
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Enter a unique code for this coupon</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={updateField}
              placeholder="e.g. 10% off for all orders"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">Brief description of the coupon's purpose</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
              <div className="relative">
                <CalendarDays size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={updateField}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">The coupon will be active starting from</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Expiration Date</label>
              <div className="relative">
                <CalendarDays size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={updateField}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">When this coupon will expire</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Type</label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={updateField}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all appearance-none cursor-pointer"
              >
                <option value="">Choose Discount Type</option>
                <option value="percentage">Percentage</option>
                <option value="fixed-amount">Fixed Amount</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Choose between percentage or fixed amount discount</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Value</label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="discountValue"
                value={formData.discountValue}
                onChange={updateField}
                placeholder="Enter Discount Value"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
              />
              <p className="mt-1 text-xs text-gray-500">Enter a fixed amount or percentage value</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Usage Limit</label>
              <select
                name="usageLimit"
                value={formData.usageLimit}
                onChange={updateField}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all appearance-none cursor-pointer"
              >
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
                <option value="unlimited">Unlimited</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Maximum number of times this coupon can be used</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Discount Amount (Optional)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="maxDiscount"
                  value={formData.maxDiscount}
                  onChange={updateField}
                  placeholder="No Limit"
                  className="w-full px-4 py-3 pr-8 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Maximum discount amount (leave empty for unlimited)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Order Amount (Optional)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={updateField}
                  placeholder="0.00"
                  className="w-full px-4 py-3 pr-8 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Minimum order amount required to use this coupon</p>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={!canCreateCoupon || isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Coupon'}
          </button>
        </div>
      </form>

      {/* Alert Modal */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[1.5rem] w-full max-w-sm p-6 shadow-xl text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${alertModal.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{alertModal.title}</h2>
            <p className="text-gray-500 text-sm mb-8">{alertModal.message}</p>
            <button 
              onClick={() => setAlertModal({ isOpen: false, title: '', message: '', type: 'warning' })}
              className="w-full px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
