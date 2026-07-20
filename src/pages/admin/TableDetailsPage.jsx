import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, Edit2, QrCode, MapPin, Users, UserCheck, 
  ShoppingBag, Calendar, AlertTriangle, Hash 
} from 'lucide-react';
import { getTableByIdAPI, getActiveQrCodeAPI, createQrCodeAPI, updateTableAPI } from '../../apis/admin/table';

export default function TableDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [editingTable, setEditingTable] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'warning' });

  const { data: table, isLoading } = useQuery({
    queryKey: ['table', id],
    queryFn: () => getTableByIdAPI(id),
  });

  const { data: qrCode, isLoading: isQrLoading } = useQuery({
    queryKey: ['qrCode', id],
    queryFn: async () => {
      try {
        return await getActiveQrCodeAPI(id);
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  const generateQrMutation = useMutation({
    mutationFn: () => createQrCodeAPI(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['qrCode', id] }),
    onError: (error) => {
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: error?.message || 'Failed to generate QR code',
        type: 'error',
      });
    }
  });

  const updateTableMutation = useMutation({
    mutationFn: ({ tableId, payload }) => updateTableAPI(tableId, payload),
    onMutate: async ({ tableId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['table', id] });
      await queryClient.cancelQueries({ queryKey: ['tables'] });
      
      const previousTable = queryClient.getQueryData(['table', id]);
      
      queryClient.setQueryData(['table', id], (old) => {
        if (!old) return old;
        return { ...old, ...payload };
      });
      
      return { previousTable };
    },
    onError: (error, variables, context) => {
      if (context?.previousTable) {
        queryClient.setQueryData(['table', id], context.previousTable);
      }
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: error?.message || 'Failed to update table',
        type: 'error',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['table', id] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onSuccess: () => {
      setEditingTable(null);
    }
  });

  const handleGenerateQr = () => generateQrMutation.mutate();

  const handleSaveEdit = () => {
    if (editingTable) {
      updateTableMutation.mutate({
        tableId: editingTable.id,
        payload: {
          capacity: editingTable.capacity,
          tableNumber: editingTable.tableNumber,
        }
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'text-green-500 bg-green-50';
      case 'OCCUPIED': return 'text-orange-500 bg-orange-50';
      case 'RESERVED': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500';
      case 'OCCUPIED': return 'bg-orange-500';
      case 'RESERVED': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading && !table) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <AlertTriangle size={48} className="mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Table Not Found</h2>
        <button onClick={() => navigate('/admin/tables')} className="text-[#FF6B00] hover:underline font-medium">
          Return to Table Management
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] font-sans px-10 pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/tables')}
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900">Table T-{table.tableNumber?.toString().padStart(2, '0')}</h3>
              {table.isAvailable === false ? (
                <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-md uppercase tracking-wider">Inactive</span>
              ) : (
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md uppercase tracking-wider">Active</span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500 flex items-center gap-2">
              <MapPin size={14} className="text-gray-400" />
              {table.branchName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setEditingTable({...table})}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            <Edit2 size={16} />
            Edit Table
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h4 className="text-lg font-bold text-gray-900 mb-6">Table Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0 shadow-sm">
                <Hash size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Table ID</p>
                <p className="text-base font-semibold text-gray-900">{table.id}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${getStatusColor(table.status)} shrink-0 shadow-sm`}>
                <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(table.status)}`}></span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Status</p>
                <p className={`text-base font-bold ${
                  table.status === 'AVAILABLE' ? 'text-green-600' :
                  table.status === 'OCCUPIED' ? 'text-orange-600' :
                  table.status === 'RESERVED' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>{table.status}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0 shadow-sm">
                <Users size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Capacity</p>
                <p className="text-base font-semibold text-gray-900">{table.capacity} Seats</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-orange-500 shrink-0 shadow-sm">
                <UserCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Guests</p>
                <p className="text-base font-semibold text-gray-900">{table.currentGuestCount || 0}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-blue-500 shrink-0 shadow-sm">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Orders</p>
                <p className="text-base font-semibold text-gray-900">{table.activeOrderCount || 0}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0 shadow-sm">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Created At</p>
                <p className="text-sm font-semibold text-gray-900">
                  {table.createdAt ? new Date(table.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* QR Code Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 mb-4">
            <QrCode size={24} />
          </div>
          <h4 className="text-lg font-bold text-gray-900 mb-2">QR Ordering</h4>
          <p className="text-sm text-gray-500 mb-8">
            Customers can scan the active QR code to view the menu and place orders directly to this table.
          </p>

          <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50/50">
            {isQrLoading || generateQrMutation.isPending ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500 font-medium">Loading QR...</span>
              </div>
            ) : qrCode ? (
              <div className="flex flex-col items-center w-full">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 mb-4 inline-block">
                  <img src={`data:image/png;base64,${qrCode.qrImageBase64}`} alt="Table QR Code" className="w-32 h-32 object-contain" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Active QR</span>
                </div>
                <button 
                  onClick={() => navigate(`/admin/tables/${table.id}/qr`)}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Manage QR Codes
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <QrCode size={28} />
                </div>
                <p className="text-sm text-gray-500 mb-4">No active QR code for this table.</p>
                <button 
                  onClick={handleGenerateQr}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#FF6B00] hover:bg-[#e66000] transition-colors shadow-md shadow-orange-500/20"
                >
                  Generate New QR
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Edit Table Modal */}
      {editingTable && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[1.5rem] w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Table Details</h2>
              <button onClick={() => setEditingTable(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Table Name/ID</label>
                <input 
                  type="number" 
                  value={editingTable.tableNumber}
                  onChange={(e) => setEditingTable({...editingTable, tableNumber: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <input 
                  type="text" 
                  value={editingTable.branchName}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none transition-colors text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of Seats</label>
                <input 
                  type="number" 
                  value={editingTable.capacity}
                  onChange={(e) => setEditingTable({...editingTable, capacity: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                />
              </div>

            </div>
            <div className="flex items-center justify-end gap-3 mt-8">
              <button 
                onClick={() => setEditingTable(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={updateTableMutation.isPending}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FF6B00] hover:bg-[#e66000] shadow-md shadow-orange-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updateTableMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[1.5rem] w-full max-w-sm p-6 shadow-xl text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${alertModal.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{alertModal.title}</h2>
            <p className="text-gray-500 text-sm mb-8">{alertModal.message}</p>
            <button 
              onClick={() => setAlertModal({ isOpen: false, title: '', message: '', type: 'warning' })}
              className="w-full px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
