import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCouponByIdAPI } from '../../apis/admin/coupon';
import { Pencil } from 'lucide-react';
import EditCouponModal from './components/coupons/EditCouponModal';
import { 
  RiArrowLeftLine, 
  RiPriceTag3Line, 
  RiCalendarEventLine, 
  RiHistoryLine, 
  RiInformationLine 
} from '@remixicon/react';

export default function CouponDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: coupon, isLoading, isError } = useQuery({
    queryKey: ['coupon', id],
    queryFn: () => getCouponByIdAPI(id),
  });

  const isExpired = (c) => {
    if (!c?.endDate) return false;
    const end = new Date(c.endDate.replace('T', ' ').replace(/-/g, '/').replace('Z', ''));

    return end.getTime() < new Date().getTime();
  };

  const isScheduled = (c) => {
    if (!c?.startDate) return false;
    const start = new Date(c.startDate.replace('T', ' ').replace(/-/g, '/').replace('Z', ''));
    return start.getTime() > new Date().getTime();
  };

  const isActuallyScheduled = coupon && (coupon.status === 'SCHEDULED' || (coupon.status === 'ACTIVE' && isScheduled(coupon)));
  const canEdit = !!coupon;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading coupon details...
      </div>
    );
  }

  if (isError || !coupon) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-gray-500">
        <RiInformationLine size={48} className="mb-4 text-gray-400" />
        <p>Coupon not found or failed to load.</p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-700 font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          >
            <RiArrowLeftLine size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              Coupon Details
              {isExpired(coupon) ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                  Expired
                </span>
              ) : isActuallyScheduled ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                  Scheduled
                </span>
              ) : (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  coupon.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {coupon.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
              )}
            </h2>
          </div>
        </div>
        
        <button 
          onClick={() => canEdit && setIsEditModalOpen(true)}
          disabled={!canEdit}
          title={!canEdit ? "Cannot edit an inactive or expired coupon" : "Edit Coupon"}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
            canEdit 
              ? "border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100" 
              : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
          }`}
        >
          <Pencil size={16} />
          Edit Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
              <RiPriceTag3Line size={20} className="text-orange-500" />
            </div>
            <h3 className="font-bold text-gray-900">Basic Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Code</label>
              <div className="font-mono font-bold text-lg text-gray-900 bg-gray-100 px-3 py-1.5 rounded inline-block">
                {coupon.code}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Description</label>
              <p className="text-gray-900 font-medium">{coupon.description || 'No description provided.'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Discount</label>
              <p className="text-gray-900 font-bold text-xl">
                {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}%` : `Rs.${coupon.discountValue}`}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <RiCalendarEventLine size={20} className="text-blue-500" />
            </div>
            <h3 className="font-bold text-gray-900">Usage & Limits</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Start Date & Time</label>
                <p className="text-gray-900 font-medium">
                  {coupon.startDate ? new Date(coupon.startDate.replace('T', ' ').replace(/-/g, '/').replace('Z', '')).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Expiration Date & Time</label>
                <p className="text-gray-900 font-medium">
                  {coupon.endDate ? new Date(coupon.endDate.replace('T', ' ').replace(/-/g, '/').replace('Z', '')).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Usage Limit</label>
                <p className="text-gray-900 font-medium">
                  {coupon.usageLimit ? coupon.usageLimit : 'Unlimited'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Times Used</label>
                <p className="text-gray-900 font-medium">
                  {coupon.usedCount || 0}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Min Order Amount</label>
                <p className="text-gray-900 font-medium">
                  {coupon.minOrderAmount ? `Rs.${coupon.minOrderAmount}` : 'None'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">Max Discount</label>
                <p className="text-gray-900 font-medium">
                  {coupon.maxDiscount ? `Rs.${coupon.maxDiscount}` : 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
            <RiHistoryLine size={20} className="text-purple-500" />
          </div>
          <h3 className="font-bold text-gray-900">System Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Coupon ID</label>
            <p className="text-gray-900 font-medium font-mono text-sm">
              {coupon.id}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Created At</label>
            <p className="text-gray-900 font-medium font-mono text-sm">
              {coupon.createdAt ? new Date(coupon.createdAt.replace('T', ' ').replace(/-/g, '/').replace('Z', '')).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Last Updated</label>
            <p className="text-gray-900 font-medium font-mono text-sm">
              {coupon.updatedAt ? new Date(coupon.updatedAt.replace('T', ' ').replace(/-/g, '/').replace('Z', '')).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditCouponModal
          coupon={coupon}
          isExpired={isExpired(coupon)}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}



