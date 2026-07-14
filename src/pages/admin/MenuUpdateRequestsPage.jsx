import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, MessageSquare, Check, X, Eye, ClipboardList } from 'lucide-react';
import { toast } from 'react-toastify';
import { getMenuUpdateRequestsAPI, makeMenuUpdateRequestDecisionAPI } from '../../apis/admin/menuUpdateRequests';
import { useAuth } from '../../context/AuthContext';
import AdminEditMenuItemModal from '../../components/admin/modal/AdminEditMenuItemModal';
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzliOWJhMyI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';

export default function MenuUpdateRequestsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: requests = [], isLoading, isError } = useQuery({
    queryKey: ['menuUpdateRequests', statusFilter],
    queryFn: () => getMenuUpdateRequestsAPI(statusFilter === 'ALL' ? '' : statusFilter),
    staleTime: 5 * 60 * 1000,
  });

  const statusOrder = { PENDING: 1, APPROVED: 2, REJECTED: 3 };
  const filteredRequests = [...requests].sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));
  const currentRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDecision = async (status) => {
    if (!selectedRequest) return;
    
    if (status === 'REJECTED' && !adminNote.trim()) {
      toast.error('Admin note is required when rejecting a request.');
      return;
    }

    try {
      setIsSubmitting(true);
      await makeMenuUpdateRequestDecisionAPI(selectedRequest.id, {
        status,
        adminNote: adminNote.trim(),
        adminName: user?.fullName || 'Admin',
      });
      toast.success(`Request ${status.toLowerCase()} successfully`);
      setSelectedRequest(null);
      setAdminNote('');
      queryClient.invalidateQueries({ queryKey: ['menuUpdateRequests'] });
    } catch (error) {
      toast.error(error.message || `Failed to ${status.toLowerCase()} request`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <ClipboardList size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Chef Update Requests</h3>
            <p className="mt-1 text-sm text-gray-500">Review and manage menu item updates requested by chefs.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex space-x-2">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="animate-pulse bg-gray-50 rounded-xl h-64 border border-gray-100"></div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500 bg-red-50 rounded-xl">
            <p>Failed to load update requests. Please try again later.</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
            <p className="text-gray-500 mt-1">There are no menu update requests matching the current filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                onClick={() => {
                  if (req.status === 'PENDING') {
                    setSelectedRequest(req);
                    setAdminNote('');
                  }
                }}
              >
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={req.menuItemImage || PLACEHOLDER_IMAGE}
                    alt={req.menuItemName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-full shadow-sm backdrop-blur-md ${
                        req.status === 'PENDING'
                          ? 'bg-amber-100/90 text-amber-800 border border-amber-200'
                          : req.status === 'APPROVED'
                          ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-200'
                          : 'bg-red-100/90 text-red-800 border border-red-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1" title={req.menuItemName}>
                      {req.menuItemName}
                    </h3>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-3 flex items-center space-x-1">
                    <span className="truncate">{req.menuCategory}</span>
                    <span>•</span>
                    <span className="truncate">{req.menuSubCategory}</span>
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Requested by:</div>
                    <div className="text-sm font-medium text-gray-900 truncate">Chef {req.chefName}</div>
                  </div>
                </div>
                
                {req.status === 'PENDING' && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm text-orange-600 font-medium group">
                    <span>Review Request</span>
                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredRequests.length)}
              </span>{' '}
              of <span className="font-medium">{filteredRequests.length}</span> results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Review Update Request</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                <img
                  src={selectedRequest.menuItemImage || PLACEHOLDER_IMAGE}
                  alt={selectedRequest.menuItemName}
                  className="w-24 h-24 object-cover rounded-lg bg-gray-100 border border-gray-100"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedRequest.menuItemName}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedRequest.menuCategory} &gt; {selectedRequest.menuSubCategory}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium text-gray-700">Requested by:</span> Chef {selectedRequest.chefName}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">Date:</span> {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <h5 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Chef's Note
                </h5>
                <p className="text-orange-800 text-sm whitespace-pre-wrap">
                  {selectedRequest.chefNote || 'No specific note provided by the chef.'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Admin Note (Required for rejection)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Provide feedback or reason for your decision..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                  rows="3"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2.5 rounded-xl font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecision('REJECTED')}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Proceed to Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRequest && (
        <AdminEditMenuItemModal
          request={selectedRequest}
          onClose={() => setShowEditModal(false)}
          onApprove={(req) => {
            setShowEditModal(false);
            handleDecision('APPROVED');
          }}
        />
      )}
    </div>
  );
}
