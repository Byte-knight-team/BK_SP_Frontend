import React, { useState } from 'react';
import { RiPriceTag3Line } from '@remixicon/react';
import { getCouponsAPI, updateCouponStatusAPI } from '../../apis/admin/coupon';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

import CouponTable from './components/coupons/CouponTable';
import CreateCouponForm from './components/coupons/CreateCouponForm';
import EditCouponModal from './components/coupons/EditCouponModal';
import ConfirmStatusModal from './components/coupons/ConfirmStatusModal';

export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState('list');
  const queryClient = useQueryClient();
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponToToggle, setCouponToToggle] = useState(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: getCouponsAPI,
  });

  const isExpired = (c) => {
    if (!c?.endDate) return false;
    const end = new Date(c.endDate.replace('T', ' ').replace(/-/g, '/').replace('Z', ''));
    end.setHours(23, 59, 59, 999);
    return end.getTime() < new Date().getTime();
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateCouponStatusAPI(id, status),
    onSuccess: () => {
      showSuccessToast('Coupon status updated');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setCouponToToggle(null);
    },
    onError: (error) => {
      showErrorToast(error.message || 'Failed to update status');
      setCouponToToggle(null);
    }
  });

  const confirmToggleStatus = () => {
    if (!couponToToggle) return;
    const newStatus = couponToToggle.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    statusMutation.mutate({ id: couponToToggle.id, status: newStatus });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Coupon Management</h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage promotional codes, discounts, and campaigns.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Total coupons:{" "}
              <span className="font-semibold text-gray-800">
                {coupons.length}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === 'list'
                  ? 'border-orange-200 bg-orange-50 text-orange-600'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <RiPriceTag3Line size={18} />
              All Coupons
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === 'create'
                  ? 'border-orange-200 bg-orange-50 text-orange-600'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              + Create Coupon
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'list' && (
        <CouponTable 
          coupons={coupons}
          isLoading={isLoading}
          onEdit={setEditingCoupon}
          onToggleStatus={setCouponToToggle}
          isToggling={statusMutation.isLoading}
        />
      )}

      {activeTab === 'create' && (
        <CreateCouponForm onSuccess={() => setActiveTab('list')} />
      )}

      {editingCoupon && (
        <EditCouponModal 
          coupon={editingCoupon} 
          isExpired={isExpired(editingCoupon)}
          onClose={() => setEditingCoupon(null)} 
        />
      )}

      {couponToToggle && (
        <ConfirmStatusModal 
          coupon={couponToToggle}
          onClose={() => setCouponToToggle(null)}
          onConfirm={confirmToggleStatus}
          isLoading={statusMutation.isLoading}
        />
      )}
    </div>
  );
}
