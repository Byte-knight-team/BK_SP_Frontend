import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Bell, HelpCircle, Settings,
  Printer, Plus, LayoutGrid, List, Filter,
  MapPin, Users, Edit2, QrCode, AlertTriangle, UserCheck, ShoppingBag, TableProperties,
  CheckCircle2, Calendar, Utensils
} from 'lucide-react';
import { getTablesAPI, updateTableAPI } from '../../apis/admin/table';
import AddTableModal from '../../components/admin/modal/AddTableModal';
import { showSuccessToast, showErrorToast } from '../../utils/toast';


// Admin page for managing table records, status, and QR actions.
export default function TableManagementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('grid');
  const [editingTable, setEditingTable] = useState(null);
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'warning' });
  const [toggleConfirmModal, setToggleConfirmModal] = useState({ isOpen: false, table: null });
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  const [activeStatusFilter, setActiveStatusFilter] = useState(statusFilter ? statusFilter.toUpperCase() : 'ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: getTablesAPI,
  });

  useEffect(() => {
    setActiveStatusFilter(statusFilter ? statusFilter.toUpperCase() : 'ALL');
  }, [statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatusFilter, availabilityFilter, searchQuery]);

  // Filter tables based on sidebar status filter + search query
  const filteredTables = tables.filter(table => {
    // Status filter from stats buttons / URL query param
    if (activeStatusFilter !== 'ALL') {
      if (table.status !== activeStatusFilter) return false;
    }

    // Availability filter
    if (availabilityFilter === 'ACTIVE' && table.isAvailable === false) return false;
    if (availabilityFilter === 'INACTIVE' && table.isAvailable !== false) return false;

    // Search query filter
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    return (
      table.tableNumber?.toString().toLowerCase().includes(query) ||
      `t-${table.tableNumber?.toString().padStart(2, '0')}`.toLowerCase().includes(query)
    );
  });

  const totalTables = tables.length;
  const availableTables = tables.filter(t => t.status === 'AVAILABLE').length;
  const occupiedTables = tables.filter(t => t.status === 'OCCUPIED').length;
  const reservedTables = tables.filter(t => t.status === 'RESERVED').length;

  const totalPages = Math.ceil(filteredTables.length / itemsPerPage);
  const paginatedTables = filteredTables.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const updateTableMutation = useMutation({
    mutationFn: ({ id, payload }) => updateTableAPI(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['tables'] });
      const previousTables = queryClient.getQueryData(['tables']);
      queryClient.setQueryData(['tables'], (old) => {
        if (!old) return old;
        return old.map(t => t.id === id ? { ...t, ...payload } : t);
      });
      return { previousTables };
    },
    onError: (error, variables, context) => {
      if (context?.previousTables) {
        queryClient.setQueryData(['tables'], context.previousTables);
      }
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: error?.message || 'Failed to update table',
        type: 'error',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    }
  });

  const handleSaveEdit = async () => {
    if (editingTable) {
      updateTableMutation.mutate(
        { 
          id: editingTable.id, 
          payload: { capacity: editingTable.capacity, tableNumber: editingTable.tableNumber }
        },
        {
          onSuccess: () => {
            setEditingTable(null);
            showSuccessToast('Table details updated successfully');
          }
        }
      );
    }
  };

    const handleToggleClick = (table) => {
    if (table.isAvailable !== false && (table.status === 'OCCUPIED' || table.status === 'RESERVED')) {
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: 'Occupied and reserved tables cannot be inactive.',
        type: 'error',
      });
      return;
    }
    setToggleConfirmModal({ isOpen: true, table: table });
  };

  const confirmToggle = async () => {
    const tableToToggle = toggleConfirmModal.table;
    if (tableToToggle) {
      const newStatus = tableToToggle.isAvailable === false ? true : false;
      updateTableMutation.mutate(
        {
          id: tableToToggle.id,
          payload: { isAvailable: newStatus }
        },
        {
          onSuccess: () => {
            showSuccessToast(`Table marked as ${newStatus ? 'Active' : 'Inactive'}`);
          },
          onSettled: () => setToggleConfirmModal({ isOpen: false, table: null })
        }
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'text-purple-500 bg-purple-50';
      case 'OCCUPIED': return 'text-orange-500 bg-orange-50';
      case 'RESERVED': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-purple-500';
      case 'OCCUPIED': return 'bg-orange-500';
      case 'RESERVED': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'AVAILABLE': return <CheckCircle2 size={16} className="mr-1.5" />;
      case 'OCCUPIED': return <Utensils size={16} className="mr-1.5" />;
      case 'RESERVED': return <Calendar size={16} className="mr-1.5" />;
      default: return null;
    }
  };

  return (
    <div className="bg-[#FAFAFA] font-sans px-10 pb-10">

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <TableProperties size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Table Management</h3>
            <p className="mt-1 text-sm text-gray-500">Configure floor plans and QR code ordering tables</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsAddTableModalOpen(true)} className="bg-[#FF6B00] hover:bg-[#e66000] text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-md shadow-orange-500/20 transition-all">
            <Plus size={18} />
            Add Table
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <button
          type="button"
          onClick={() => setActiveStatusFilter('ALL')}
          className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-center text-left transition-all ${activeStatusFilter === 'ALL'
              ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-200/70'
              : 'bg-white border-gray-100 hover:border-orange-100'
            }`}
        >
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">TOTAL TABLES</div>
          <div className="text-3xl font-extrabold text-gray-900">{totalTables}</div>
        </button>
        <button
          type="button"
          onClick={() => setActiveStatusFilter('AVAILABLE')}
          className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-center text-left transition-all ${activeStatusFilter === 'AVAILABLE'
              ? 'bg-purple-100 border-purple-200 ring-2 ring-purple-200/80'
              : 'bg-purple-50 border-purple-100/50 hover:border-purple-200'
            }`}
        >
          <div className="text-[11px] font-bold text-purple-500 uppercase tracking-wider mb-2">AVAILABLE</div>
          <div className="text-3xl font-extrabold text-purple-600">{availableTables}</div>
        </button>
        <button
          type="button"
          onClick={() => setActiveStatusFilter('OCCUPIED')}
          className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-center text-left transition-all ${activeStatusFilter === 'OCCUPIED'
              ? 'bg-orange-100 border-orange-200 ring-2 ring-orange-200/80'
              : 'bg-orange-50 border-orange-100/50 hover:border-orange-200'
            }`}
        >
          <div className="text-[11px] font-bold text-orange-500 uppercase tracking-wider mb-2">OCCUPIED</div>
          <div className="text-3xl font-extrabold text-orange-600">{occupiedTables}</div>
        </button>
        <button
          type="button"
          onClick={() => setActiveStatusFilter('RESERVED')}
          className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-center text-left transition-all ${activeStatusFilter === 'RESERVED'
              ? 'bg-blue-100 border-blue-200 ring-2 ring-blue-200/80'
              : 'bg-blue-50 border-blue-100/50 hover:border-blue-200'
            }`}
        >
          <div className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-2">RESERVED</div>
          <div className="text-3xl font-extrabold text-blue-600">{reservedTables}</div>
        </button>
      </div>

      {/* Search & View Controls Row */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center bg-white border border-gray-100 rounded-2xl px-4 py-2.5 w-full max-w-md shadow-sm">
          <Search size={18} className="text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search by table number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 outline-none focus:border-orange-300 shadow-sm"
          >
            <option value="ALL">All Tables</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
          <div className="flex bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-orange-50 text-[#FF6B00]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-orange-50 text-[#FF6B00]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Tables Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTables.length === 0 && !isLoading && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
              <Search size={40} className="mb-4 text-gray-300" />
              <p className="text-lg font-semibold text-gray-500">No tables found</p>
              <p className="text-sm mt-1">Try a different search term or clear the search bar</p>
            </div>
          )}
          {paginatedTables.map((table) => (
            <div key={table.id} onClick={() => navigate(`/admin/tables/${table.id}`)} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 flex flex-col cursor-pointer hover:shadow-md hover:border-orange-200 transition-all">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">T-{table.tableNumber?.toString().padStart(2, '0')}</h3>
                <div className="flex flex-col items-end gap-2">
                  {table.isAvailable === false ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      Inactive
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                      Active
                    </span>
                  )}
                  <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="sr-only peer" checked={table.isAvailable !== false} onChange={() => handleToggleClick(table)} />
                    <div className="w-7 h-4 bg-red-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>

              <div className="mb-5 flex items-center justify-between">
                <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(table.status)}`}>
                  {getStatusIcon(table.status)}
                  {table.status.charAt(0) + table.status.slice(1).toLowerCase()}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-4 border-t border-gray-100">
                <div className="flex flex-col items-center justify-center text-center">
                  <Users size={18} className="mb-1 text-indigo-500" />
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Capacity</span>
                  <span className="text-lg font-semibold text-gray-900">{table.capacity}</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <UserCheck size={18} className="mb-1 text-orange-500" />
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Guests</span>
                  <span className="text-lg font-semibold text-gray-900">{table.currentGuestCount || 0}</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <ShoppingBag size={18} className="mb-1 text-blue-500" />
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Orders</span>
                  <span className="text-lg font-semibold text-gray-900">{table.activeOrderCount || 0}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-auto pt-2">
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setEditingTable({ ...table }); }}
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <Link
                  to={`/admin/tables/${table.id}/qr`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <QrCode size={18} />
                </Link>
              </div>
            </div>
          ))}

          {/* Add New Table Card */}
          <button type="button" onClick={() => setIsAddTableModalOpen(true)} className="bg-[#FFFBF7] rounded-[1.5rem] p-5 border border-dashed border-orange-200 flex flex-col items-center justify-center min-h-[220px] hover:bg-orange-50/50 transition-colors group text-left">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#FF6B00] mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-2">Add New Table</h3>
            <p className="text-xs font-semibold text-[#FF6B00]">Expansion mode</p>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredTables.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Search size={40} className="mb-4 text-gray-300" />
              <p className="text-lg font-semibold text-gray-500">No tables found</p>
              <p className="text-sm mt-1">Try a different search term or clear the search bar</p>
            </div>
          )}
          {paginatedTables.map((table) => (
            <div key={table.id} onClick={() => navigate(`/admin/tables/${table.id}`)} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:shadow-md hover:border-orange-200 transition-all">
              <div className="flex items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">T-{table.tableNumber?.toString().padStart(2, '0')}</h3>
                    {table.isAvailable === false ? (
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-md uppercase tracking-wider">Inactive</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md uppercase tracking-wider">Active</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-1">
                    <div className="flex items-center text-gray-500 text-xs font-medium">
                      <Users size={14} className="mr-1.5 text-gray-400" />
                      {table.capacity} Seats
                    </div>
                    <div className="flex items-center text-gray-500 text-xs font-medium">
                      <UserCheck size={14} className="mr-1.5 text-orange-400" />
                      {table.currentGuestCount || 0} Guests
                    </div>
                    <div className="flex items-center text-gray-500 text-xs font-medium">
                      <ShoppingBag size={14} className="mr-1.5 text-blue-400" />
                      {table.activeOrderCount || 0} Orders
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 sm:gap-10 pl-[72px] md:pl-0">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{table.isAvailable === false ? 'Inactive' : 'Active'}</span>
                  <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="sr-only peer" checked={table.isAvailable !== false} onChange={() => handleToggleClick(table)} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                  </label>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  <span className={`w-2 h-2 rounded-full ${getStatusDotColor(table.status)}`}></span>
                  <span className={
                    table.status === 'AVAILABLE' ? 'text-purple-500' :
                      table.status === 'OCCUPIED' ? 'text-orange-500' :
                        table.status === 'RESERVED' ? 'text-blue-500' :
                          'text-gray-500'
                  }>{table.status}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingTable({ ...table }); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <Link
                    to={`/admin/tables/${table.id}/qr`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent transition-colors"
                  >
                    <QrCode size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Table Button - List View */}
          <button type="button" onClick={() => setIsAddTableModalOpen(true)} className="bg-[#FFFBF7] rounded-2xl py-4 border border-dashed border-orange-200 flex items-center justify-center gap-3 hover:bg-orange-50/50 transition-colors group">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#FF6B00] shadow-sm group-hover:scale-110 transition-transform">
              <Plus size={18} />
            </div>
            <span className="text-[15px] font-bold text-gray-900">Add New Table</span>
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors ${
                  currentPage === page 
                    ? 'bg-[#FF6B00] text-white' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

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
                  onChange={(e) => setEditingTable({ ...editingTable, tableNumber: parseInt(e.target.value) || 0 })}
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
                  onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) || 0 })}
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

      {/* Alert Modal (Warning/Error) */}
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

      {/* Toggle Confirmation Modal */}
      {toggleConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[1.5rem] w-full max-w-sm p-6 shadow-xl text-center">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-orange-50 text-orange-500">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Change Availability?</h2>
            <p className="text-gray-500 text-sm mb-8">
              Are you sure you want to mark Table T-{toggleConfirmModal.table?.tableNumber} as <strong className="text-gray-900">{toggleConfirmModal.table?.isAvailable === false ? 'ACTIVE' : 'INACTIVE'}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setToggleConfirmModal({ isOpen: false, table: null })}
                className="flex-1 px-5 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggle}
                disabled={updateTableMutation.isPending}
                className="flex-1 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-[#FF6B00] hover:bg-[#e66000] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updateTableMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Confirming...
                  </>
                ) : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AddTableModal
        isOpen={isAddTableModalOpen}
        onClose={() => setIsAddTableModalOpen(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['tables'] })}
      />


    </div>
  );
}
