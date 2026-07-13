import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Package,
  Tag,
  DollarSign,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getMenuItemByIdAPI, approveMenuItemAPI, rejectMenuItemAPI } from '../../apis/admin/menu';
import { getMenuItemIngredientsAPI } from '../../apis/kitchen/menu';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzliOWJhMyI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';

const normalizeStatus = (status) => {
  const normalized = status?.toUpperCase();
  if (normalized === 'AVAILABLE') return 'ACTIVE';
  if (normalized === 'UNAVAILABLE') return 'INACTIVE';
  return normalized || '';
};

const getStatusDisplay = (status) => {
  switch (normalizeStatus(status)) {
    case 'ACTIVE':
      return 'Active';
    case 'INACTIVE':
      return 'Inactive';
    case 'PENDING':
      return 'Pending';
    case 'REJECTED':
      return 'Rejected';
    default:
      return status || 'Unknown';
  }
};

const getStatusColor = (status) => {
  switch (normalizeStatus(status)) {
    case 'ACTIVE':
      return 'bg-[#d8f5e4] text-[#118a45]';
    case 'INACTIVE':
      return 'bg-[#ffe2d1] text-[#c85b1d]';
    case 'PENDING':
      return 'bg-[#fff6cc] text-[#a17a00]';
    case 'REJECTED':
      return 'bg-[#ffe3e3] text-[#c53030]';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export default function MenuItemDetailsPage() {
  const navigate = useNavigate();
  const { id: itemId } = useParams();

  const queryClient = useQueryClient();

  const { data: item, isLoading: isItemLoading, error: itemError } = useQuery({
    queryKey: ['menuItem', itemId],
    queryFn: () => getMenuItemByIdAPI(itemId),
    initialData: () => {
      const allItems = queryClient.getQueryData(['menuItems']);
      return allItems?.find(i => String(i.id) === String(itemId));
    },
  });

  const { data: ingredientsRes } = useQuery({
    queryKey: ['menuItemIngredients', itemId],
    queryFn: () => getMenuItemIngredientsAPI(itemId),
  });

  const ingredients = ingredientsRes && !ingredientsRes.error ? (ingredientsRes.data || []) : [];
  const isLoading = isItemLoading && !item; // Show loading only if we have NO data (no initialData)

  useEffect(() => {
    if (itemError) {
      toast.error(itemError.message || 'Unable to load menu item.');
    }
  }, [itemError]);

  const [decisionItemId, setDecisionItemId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const handleImageError = (event) => {
    event.target.src = PLACEHOLDER_IMAGE;
  };

  const handleApprovePendingItem = async () => {
    setDecisionItemId(item.id);

    try {
      const action = await approveMenuItemAPI(item.id, {});
      const nextStatus = normalizeStatus(action?.type) || 'ACTIVE';
      queryClient.setQueryData(['menuItem', itemId], (old) => ({ ...old, status: nextStatus }));
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Item approved successfully.');
      // Optionally navigate back after approval
      setTimeout(() => navigate('/admin/menu'), 1000);
    } catch (error) {
      toast.error(error.message || 'Unable to approve item.');
    } finally {
      setDecisionItemId(null);
    }
  };

  const handleRejectPendingItem = () => {
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleCancelReject = () => {
    setShowRejectModal(false);
    setRejectionReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }

    setDecisionItemId(item.id);

    try {
      const action = await rejectMenuItemAPI(item.id, rejectionReason.trim());
      const nextStatus = normalizeStatus(action?.type) || 'REJECTED';
      queryClient.setQueryData(['menuItem', itemId], (old) => ({ ...old, status: nextStatus }));
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setShowRejectModal(false);
      setRejectionReason('');
      toast.success('Item rejected successfully.');
      // Optionally navigate back after rejection
      setTimeout(() => navigate('/admin/menu'), 1000);
    } catch (error) {
      toast.error(error.message || 'Unable to reject item.');
    } finally {
      setDecisionItemId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#FAFAFA] font-sans py-16">
        <p className="text-center text-gray-500 text-sm">Loading menu item details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-[#FAFAFA] font-sans py-16">
        <div className="max-w-2xl mx-auto px-8">
          <p className="text-center text-gray-500 text-sm mb-4">Menu item not found.</p>
          <button
            onClick={() => navigate('/admin/menu')}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] font-sans">
      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Menu Item</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a rejection reason for the chef:</p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all resize-none"
              rows={4}
            />
            
            <div className="flex items-center gap-3 justify-end mt-6">
              <button
                onClick={handleCancelReject}
                disabled={decisionItemId === item.id}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={decisionItemId === item.id}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-70"
              >
                {decisionItemId === item.id ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-8 pb-10">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 mt-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/menu')}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Menu Item Details</h1>
              <p className="text-gray-500 text-sm mt-1">View complete information about this menu item</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/admin/menu/edit/${itemId}`)}
            disabled={item.categoryStatus === 'INACTIVE'}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm shadow-md transition-all ${
              item.categoryStatus === 'INACTIVE'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                : 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-lg'
            }`}
            title={item.categoryStatus === 'INACTIVE' ? 'Cannot edit items in an inactive category' : 'Edit Item'}
          >
            Edit Item
          </button>
        </div>

        {/* Action Bar (Top) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Image */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative h-80 bg-gray-100">
                <img
                  src={item.imageUrl || PLACEHOLDER_IMAGE}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  onError={handleImageError}
                />
                <div className={`absolute top-3 right-3 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide ${getStatusColor(item.status)}`}>
                  {getStatusDisplay(item.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            {/* General Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <Package size={16} className="text-orange-500" />
                </div>
                <h2 className="text-base font-bold text-gray-900">General Information</h2>
              </div>

              {/* Item Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name</label>
                <p className="text-sm text-gray-900">{item.name}</p>
              </div>

              {/* Category & Subcategory & Price */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <p className="text-sm text-gray-900">{item.categoryName || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sub Category</label>
                  <p className="text-sm text-gray-900">{item.subCategory || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Base Price (LKR)</label>
                  <p className="text-sm font-semibold text-orange-600">
                    {Number(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prep Time</label>
                  <p className="text-sm text-gray-900">
                    {item.preparationTime ? `${item.preparationTime} min` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <FileText size={16} className="text-blue-500" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Description</h2>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.description}</p>
              </div>
            )}

            {/* Ingredients */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                  <FileText size={16} className="text-emerald-500" />
                </div>
                <h2 className="text-base font-bold text-gray-900">Ingredients</h2>
              </div>
              {ingredients && ingredients.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {ingredients.map((ing) => (
                    <li key={ing.id || ing.inventoryItemId} className="text-sm text-gray-700">
                      <span className="font-medium">{ing.inventoryItemName}</span> - {ing.quantityRequired} {ing.unit}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic"></p>
              )}
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                  <Tag size={16} className="text-gray-600" />
                </div>
                <h2 className="text-base font-bold text-gray-900">Additional Information</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Availability Status</span>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusColor(item.status)}`}>
                    {getStatusDisplay(item.status)}
                  </span>
                </div>

                {normalizeStatus(item.status) === 'PENDING' && (
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleApprovePendingItem}
                      disabled={decisionItemId === item.id}
                      className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-70"
                    >
                      {decisionItemId === item.id ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectPendingItem}
                      disabled={decisionItemId === item.id}
                      className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-70"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {item.imagePublicId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Image ID</span>
                    <span className="text-xs text-gray-500 font-mono">{item.imagePublicId}</span>
                  </div>
                )}

                {item.id && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Item ID</span>
                    <span className="text-xs text-gray-500 font-mono">{item.id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
