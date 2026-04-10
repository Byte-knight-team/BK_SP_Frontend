import React from 'react';
import { 
  Search, Bell, HelpCircle, Settings, 
  Printer, Plus, LayoutGrid, List, Filter,
  MapPin, Users, Edit2, QrCode, MoreHorizontal
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

export default function TableManagementPage() {
  const tables = [
    { id: '01', name: 'T-01', location: 'Indoor - Main', seats: 2, status: 'AVAILABLE' },
    { id: '02', name: 'T-02', location: 'Indoor - Main', seats: 4, status: 'OCCUPIED' },
    { id: '03', name: 'T-03', location: 'Indoor - Main', seats: 4, status: 'RESERVED' },
    { id: '04', name: 'T-04', location: 'Outdoor - Terrace', seats: 6, status: 'AVAILABLE' },
    { id: '05', name: 'T-05', location: 'Outdoor - Terrace', seats: 2, status: 'CLEANING' },
    { id: '06', name: 'T-06', location: 'VIP Lounge', seats: 8, status: 'AVAILABLE' },
    { id: '07', name: 'T-07', location: 'Indoor - Window', seats: 4, status: 'OCCUPIED' },
    { id: '08', name: 'T-08', location: 'Indoor - Window', seats: 2, status: 'AVAILABLE' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'text-green-500 bg-green-50';
      case 'OCCUPIED': return 'text-orange-500 bg-orange-50';
      case 'RESERVED': return 'text-blue-500 bg-blue-50';
      case 'CLEANING': return 'text-gray-500 bg-gray-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500';
      case 'OCCUPIED': return 'bg-orange-500';
      case 'RESERVED': return 'bg-blue-500';
      case 'CLEANING': return 'bg-gray-500';
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
              <button className="bg-[#FF6B00] hover:bg-[#e66000] text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-md shadow-orange-500/20 transition-all">
                <Plus size={18} />
                Add Table
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">TOTAL TABLES</div>
              <div className="text-3xl font-extrabold text-gray-900">8</div>
            </div>
            <div className="bg-green-50 rounded-2xl p-5 border border-green-100/50 shadow-sm flex flex-col justify-center">
              <div className="text-[11px] font-bold text-green-500 uppercase tracking-wider mb-2">AVAILABLE</div>
              <div className="text-3xl font-extrabold text-green-600">4</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100/50 shadow-sm flex flex-col justify-center">
              <div className="text-[11px] font-bold text-orange-500 uppercase tracking-wider mb-2">OCCUPIED</div>
              <div className="text-3xl font-extrabold text-orange-600">2</div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100/50 shadow-sm flex flex-col justify-center">
              <div className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-2">RESERVED</div>
              <div className="text-3xl font-extrabold text-blue-600">1</div>
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
                <button className="p-2 bg-orange-50 text-[#FF6B00] rounded-lg">
                  <LayoutGrid size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                  <List size={18} />
                </button>
              </div>
              <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-600 shadow-sm">
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map((table) => (
              <div key={table.id} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold ${getStatusColor(table.status)}`}>
                    {table.id}
                  </div>
                  <button className="text-gray-300 hover:text-gray-500">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-3">{table.name}</h3>
                
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center text-gray-500 text-xs font-medium">
                    <MapPin size={14} className="mr-2 text-gray-400" />
                    {table.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-xs font-medium">
                      <Users size={14} className="mr-2 text-gray-400" />
                      {table.seats} Seats
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
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
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
            <button className="bg-[#FFFBF7] rounded-[1.5rem] p-5 border border-dashed border-orange-200 flex flex-col items-center justify-center min-h-[220px] hover:bg-orange-50/50 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#FF6B00] mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <h3 className="text-[15px] font-bold text-gray-900 mb-2">Add New Table</h3>
              <p className="text-xs font-semibold text-[#FF6B00]">Expansion mode</p>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
