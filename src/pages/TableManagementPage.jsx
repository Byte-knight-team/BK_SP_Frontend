import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Bell, HelpCircle, Settings, 
  Printer, Plus, LayoutGrid, List, Filter,
  MapPin, Users, Edit2, QrCode, MoreHorizontal, AlertTriangle, UserCheck, ShoppingBag
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

export default function TableManagementPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'warning' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, tableId: null, tableName: '' });
  
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8080/api/tables');
      if (response.ok) {
        const data = await response.json();
        setTables(data);
      } else {
        console.error("Failed to fetch tables");
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalTables = tables.length;
  const availableTables = tables.filter(t => t.status === 'AVAILABLE').length;
  const occupiedTables = tables.filter(t => t.status === 'OCCUPIED').length;
  const reservedTables = tables.filter(t => t.status === 'RESERVED').length;

  const toggleDropdown = (id) => {
    if (openDropdownId === id) setOpenDropdownId(null);
    else setOpenDropdownId(id);
  };

  const handleDeleteTable = (id) => {
    const tableToDelete = tables.find(t => t.id === id);
    if (!tableToDelete) return;
    setOpenDropdownId(null);

    setConfirmModal({
      isOpen: true,
      tableId: id,
      tableName: tableToDelete.tableNumber
    });
  };

  const confirmDelete = async () => {
    const id = confirmModal.tableId;
    setConfirmModal({ isOpen: false, tableId: null, tableName: '' });
    
    try {
      const response = await fetch(`http://localhost:8080/api/tables/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTables(prev => prev.filter(t => t.id !== id));
      } else {
        const errorText = await response.text();
        let errorMessage = "Could not delete the table.";
        
        try {
          const errData = JSON.parse(errorText);
          errorMessage = errData.message || (errData.error ? `${errData.error}: ${errData.trace || errData.path}` : errorMessage);
        } catch(e) {
          // If it's not JSON, it might be a plain string from the backend
          errorMessage = errorText || errorMessage;
        }

        setAlertModal({
          isOpen: true,
          title: 'Delete Failed',
          message: errorMessage,
          type: 'error'
        });
      }
    } catch (error) {
      console.error("Backend request failed:", error);
      setAlertModal({
        isOpen: true,
        title: 'Network Error',
        message: 'Could not connect to the backend server. Please check your connection.',
        type: 'error'
      });
    }
  };

  const handleSaveEdit = async () => {
    if (editingTable) {
      try {
        const response = await fetch(`http://localhost:8080/api/tables/${editingTable.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tableNumber: editingTable.tableNumber,
            capacity: editingTable.capacity,
            status: editingTable.status
          })
        });
        
        if (response.ok) {
          const updatedTable = await response.json();
          setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
          setEditingTable(null);
        } else {
          const errData = await response.json();
          setAlertModal({ isOpen: true, title: 'Error', message: errData.message || 'Failed to update table', type: 'error' });
        }
      } catch (error) {
        setAlertModal({ isOpen: true, title: 'Network Error', message: 'Could not connect to the backend server.', type: 'error' });
      }
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

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans">
      <AdminSidebar activePage="/admin/tables" />

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
        {/* Header - Identical to AdminDashboard */}
        <AdminHeader />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-10 pb-10">
          
          {/* Page Title & Actions */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Table Management</h1>
              <p className="text-gray-500 text-sm mt-1">Configure floor plans and QR code ordering tables</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-sm">
                <Printer size={16} />
                Print All QR
              </button>
              <Link to="/admin/tables/add" className="bg-[#FF6B00] hover:bg-[#e66000] text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-md shadow-orange-500/20 transition-all">
                <Plus size={18} />
                Add Table
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">TOTAL TABLES</div>
              <div className="text-3xl font-extrabold text-gray-900">{totalTables}</div>
            </div>
            <div className="bg-green-50 rounded-2xl p-5 border border-green-100/50 shadow-sm flex flex-col justify-center">
              <div className="text-[11px] font-bold text-green-500 uppercase tracking-wider mb-2">AVAILABLE</div>
              <div className="text-3xl font-extrabold text-green-600">{availableTables}</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100/50 shadow-sm flex flex-col justify-center">
              <div className="text-[11px] font-bold text-orange-500 uppercase tracking-wider mb-2">OCCUPIED</div>
              <div className="text-3xl font-extrabold text-orange-600">{occupiedTables}</div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100/50 shadow-sm flex flex-col justify-center">
              <div className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-2">RESERVED</div>
              <div className="text-3xl font-extrabold text-blue-600">{reservedTables}</div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center bg-white border border-gray-100 rounded-2xl px-4 py-2.5 w-full max-w-md shadow-sm">
              <Search size={18} className="text-gray-400 mr-3" />
              <input type="text" placeholder="Search tables or zones..." className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400" />
            </div>
            
            <div className="flex items-center gap-3">
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
              <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-600 shadow-sm">
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Tables Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tables.map((table) => (
                <div key={table.id} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold ${getStatusColor(table.status)}`}>
                      {table.id}
                    </div>
                    <div className="relative">
                      <button 
                        className="text-gray-300 hover:text-gray-500"
                        onClick={() => toggleDropdown(table.id)}
                      >
                        <MoreHorizontal size={20} />
                      </button>
                      {openDropdownId === table.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 overflow-hidden">
                          <button 
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => handleDeleteTable(table.id)}
                          >
                            Delete table
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-3">T-{table.tableNumber?.toString().padStart(2, '0')}</h3>
                  
                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500 text-xs font-medium">
                        <MapPin size={14} className="mr-2 text-gray-400" />
                        {table.branchName}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                        <span className={`w-2 h-2 rounded-full ${getStatusDotColor(table.status)}`}></span>
                        <span className={
                          table.status === 'AVAILABLE' ? 'text-green-500' :
                          table.status === 'OCCUPIED' ? 'text-orange-500' :
                          table.status === 'RESERVED' ? 'text-blue-500' :
                          'text-gray-500'
                        }>{table.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Capacity</span>
                        <div className="flex items-center text-gray-700 text-xs font-bold">
                          <Users size={12} className="mr-1.5 text-gray-400" />
                          {table.capacity}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Guests</span>
                        <div className="flex items-center text-gray-700 text-xs font-bold">
                          <UserCheck size={12} className="mr-1.5 text-orange-400" />
                          {table.currentGuestCount || 0}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Orders</span>
                        <div className="flex items-center text-gray-700 text-xs font-bold">
                          <ShoppingBag size={12} className="mr-1.5 text-blue-400" />
                          {table.activeOrderCount || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <button 
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setEditingTable({...table})}
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button className="w-[42px] h-[42px] flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent transition-colors">
                      <QrCode size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Table Card */}
              <Link to="/admin/tables/add" className="bg-[#FFFBF7] rounded-[1.5rem] p-5 border border-dashed border-orange-200 flex flex-col items-center justify-center min-h-[220px] hover:bg-orange-50/50 transition-colors group">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#FF6B00] mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
                <h3 className="text-[15px] font-bold text-gray-900 mb-2">Add New Table</h3>
                <p className="text-xs font-semibold text-[#FF6B00]">Expansion mode</p>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {tables.map((table) => (
                <div key={table.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold ${getStatusColor(table.status)} shrink-0`}>
                      {table.id}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">T-{table.tableNumber?.toString().padStart(2, '0')}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-1">
                        <div className="flex items-center text-gray-500 text-xs font-medium">
                          <MapPin size={14} className="mr-1.5 text-gray-400" />
                          {table.branchName}
                        </div>
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
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      <span className={`w-2 h-2 rounded-full ${getStatusDotColor(table.status)}`}></span>
                      <span className={
                        table.status === 'AVAILABLE' ? 'text-green-500' :
                        table.status === 'OCCUPIED' ? 'text-orange-500' :
                        table.status === 'RESERVED' ? 'text-blue-500' :
                        'text-gray-500'
                      }>{table.status}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingTable({...table})}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent transition-colors">
                        <QrCode size={16} />
                      </button>
                      <div className="relative">
                        <button 
                          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-300 hover:text-gray-500 transition-colors"
                          onClick={() => toggleDropdown(table.id)}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {openDropdownId === table.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 overflow-hidden">
                            <button 
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() => handleDeleteTable(table.id)}
                            >
                              Delete table
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add New Table Button - List View */}
              <Link to="/admin/tables/add" className="bg-[#FFFBF7] rounded-2xl py-4 border border-dashed border-orange-200 flex items-center justify-center gap-3 hover:bg-orange-50/50 transition-colors group">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#FF6B00] shadow-sm group-hover:scale-110 transition-transform">
                  <Plus size={18} />
                </div>
                <span className="text-[15px] font-bold text-gray-900">Add New Table</span>
              </Link>
            </div>
          )}

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
                    type="text" 
                    value={editingTable.tableNumber}
                    onChange={(e) => setEditingTable({...editingTable, tableNumber: e.target.value})}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select 
                    value={editingTable.status}
                    onChange={(e) => setEditingTable({...editingTable, status: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="RESERVED">RESERVED</option>
                  </select>
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
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FF6B00] hover:bg-[#e66000] shadow-md shadow-orange-500/20 transition-all"
                >
                  Save Changes
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

        {/* Delete Confirmation Modal */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[1.5rem] w-full max-w-sm p-6 shadow-xl text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Table?</h2>
              <p className="text-gray-500 text-sm mb-8">
                Are you sure you want to delete <span className="font-bold text-gray-700">T-{confirmModal.tableName?.toString().padStart(2, '0')}</span>? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setConfirmModal({ isOpen: false, tableId: null, tableName: '' })}
                  className="flex-1 px-5 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
