import React, { useMemo, useState } from 'react';
import { CalendarDays, CircleDot, Sparkles } from 'lucide-react';

const initialFormState = {
  couponCode: '',
  couponType: '',
  startDate: '',
  expirationDate: '',
  discountType: '',
  discountValue: '',
  usageLimit: '100',
  platform: 'all',
  maxDiscount: '100',
  minPurchase: '',
  minimumPurchaseAmount: '0',
  maximumDiscountAmount: '0',
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

export default function CouponsPage() {
  const [formData, setFormData] = useState(initialFormState);

  const canCreateCoupon = useMemo(() => {
    return (
      formData.couponCode.trim().length > 0
      && formData.couponType.trim().length > 0
      && formData.startDate.trim().length > 0
      && formData.expirationDate.trim().length > 0
      && formData.discountType.trim().length > 0
      && formData.discountValue.trim().length > 0
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

  const handleSubmit = (event) => {
    event.preventDefault();
    // Reserved for API integration when coupon endpoints are available.
    console.log('Coupon payload', formData);
  };

  return (
    <div className="bg-[#FAFAFA] font-sans px-10 pb-10">
      <div className="mb-8 mt-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Coupon</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details below to create a new coupon</p>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Coupon Types</label>
            <select
              name="couponType"
              value={formData.couponType}
              onChange={updateField}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all appearance-none cursor-pointer"
            >
              <option value="">Select Audiences</option>
              <option value="all-customers">All Customers</option>
              <option value="new-customers">New Customers</option>
              <option value="premium-members">Premium Members</option>
              <option value="birthday-offer">Birthday Offer</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Identify the target audience for this coupon</p>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
              <select
                name="platform"
                value={formData.platform}
                onChange={updateField}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Platform</option>
                <option value="web">Web</option>
                <option value="mobile">Mobile</option>
                <option value="in-store">In-Store</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Apply to all platforms if none selected</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Discount</label>
              <input
                type="number"
                min="0"
                name="maxDiscount"
                value={formData.maxDiscount}
                onChange={updateField}
                placeholder="Enter Max Discount"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
              />
              <p className="mt-1 text-xs text-gray-500">Maximum discount that can be applied with this coupon</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Min Purchase</label>
              <input
                type="number"
                min="0"
                name="minPurchase"
                value={formData.minPurchase}
                onChange={updateField}
                placeholder="Enter Min Purchase"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum purchase amount required to use this coupon</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Purchase Amount</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  name="minimumPurchaseAmount"
                  value={formData.minimumPurchaseAmount}
                  onChange={updateField}
                  className="w-full px-4 py-3 pr-8 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Minimum order amount required (0 for no minimum)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum Discount Amount</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  name="maximumDiscountAmount"
                  value={formData.maximumDiscountAmount}
                  onChange={updateField}
                  className="w-full px-4 py-3 pr-8 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Maximum discount amount (0 for unlimited)</p>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-gray-100 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Continue to Advanced Settings
          </button>
          <button
            type="submit"
            disabled={!canCreateCoupon}
            className="px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Create Coupon
          </button>
        </div>
      </form>
    </div>
  );
}
