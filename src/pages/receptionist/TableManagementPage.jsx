import React, { useState } from 'react';
import TableCard from '../../components/receptionist/TableCard';
import TableActionModal from '../../components/receptionist/TableActionModal';
import { PlusCircle, Search, Filter } from 'lucide-react';

const TableManagementPage = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- MOCK DATA (So you can see the design immediately) ---
  const [tables, setTables] = useState([
    { id: 101, tableNumber: 1, capacity: 4, status: 'AVAILABLE', currentGuestCount: 0, activeOrderCount: 0 },
    { id: 102, tableNumber: 2, capacity: 2, status: 'OCCUPIED', currentGuestCount: 2, activeOrderCount: 1 },
    { id: 103, tableNumber: 3, capacity: 6, status: 'RESERVED', currentGuestCount: 0, activeOrderCount: 0 },
    { id: 104, tableNumber: 4, capacity: 4, status: 'OCCUPIED', currentGuestCount: 4, activeOrderCount: 3 },
    { id: 105, tableNumber: 5, capacity: 8, status: 'AVAILABLE', currentGuestCount: 0, activeOrderCount: 0 },
  ]);

  const handleCardClick = (table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    console.log("Refreshing table data...");
    // This will call the real API later
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      
      {/* 1. Header Section */}
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Table Management</h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Branch 01 • Live Floor Map</p>
        </div>

        {/* --- BOOK A TABLE BUTTON (Top Right) --- */}
        <button 
          onClick={() => alert("Opening Reservation Form...")}
          className="flex items-center gap-2 rounded-2xl bg-black px-6 py-4 font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <PlusCircle size={20} />
          BOOK A TABLE
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by table number..." 
            className="w-full rounded-2xl border-none bg-white py-4 pr-4 pl-12 font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-black transition-all"
          />
        </div>
        <button className="flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-gray-600 shadow-sm hover:bg-gray-50">
          <Filter size={18} />
          ALL TABLES
        </button>
      </div>

      {/* 3. Table Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => (
          <TableCard 
            key={table.id} 
            table={table} 
            onClick={handleCardClick} 
          />
        ))}
      </div>

      {/* 4. The Action Modal */}
      <TableActionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        table={selectedTable}
        onUpdate={handleRefresh}
      />

      {/* 5. Quick Legend (Bottom) */}
      <div className="mt-12 flex items-center justify-center gap-6 border-t border-gray-200 pt-8">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <div className="h-3 w-3 rounded-full bg-green-500" /> Available
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <div className="h-3 w-3 rounded-full bg-red-500" /> Occupied
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <div className="h-3 w-3 rounded-full bg-blue-500" /> Reserved
        </div>
      </div>

    </div>
  );
};

export default TableManagementPage;
