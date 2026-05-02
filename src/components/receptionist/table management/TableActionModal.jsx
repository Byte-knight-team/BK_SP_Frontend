import React, { useState, useEffect } from 'react';
import { X, Users, CheckCircle, Ban, LogOut, ChevronUp, ChevronDown, LayoutGrid } from 'lucide-react';

const TableActionModal = ({ isOpen, onClose, table, onUpdate }) => {
  const [guestCount, setGuestCount] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (table) {
      setGuestCount(table.currentGuestCount > 0 ? table.currentGuestCount : 1);
    }
  }, [table, isOpen]);

  if (!isOpen || !table) return null;

  const handleAction = async (actionType) => {
    setLoading(true);
    console.log(`Action: ${actionType} for Table ${table.id}`);
    setTimeout(() => {
      setLoading(false);
      onUpdate();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-4xl bg-white p-8 shadow-2xl">
        
        {/* Header Section (Kitchen Style) */}
        <div className="mb-6 flex items-start justify-between">
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
            <LayoutGrid size={24} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <h3 className="mb-1 text-xl font-bold text-gray-900">Table {table.tableNumber}</h3>
        <p className="mb-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Status: {table.status}</p>

        {/* Guest Counter (Kitchen Input Style) */}
        {table.status !== 'RESERVED' && (
          <div className="mb-8 flex flex-col items-center justify-center rounded-2xl bg-gray-50 p-6">
            <span className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Guests</span>
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                className="rounded-xl bg-white p-2 shadow-sm hover:bg-gray-100 transition-all"
              >
                <ChevronDown size={20} className="text-gray-600" />
              </button>
              <span className="text-4xl font-black text-gray-800">{guestCount}</span>
              <button 
                onClick={() => setGuestCount(Math.min(table.capacity, guestCount + 1))}
                className="rounded-xl bg-white p-2 shadow-sm hover:bg-gray-100 transition-all"
              >
                <ChevronUp size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {table.status === 'AVAILABLE' && (
            <button 
              onClick={() => handleAction('OCCUPY')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all"
            >
              <CheckCircle size={18} />
              START GUEST SESSION
            </button>
          )}

          {table.status === 'OCCUPIED' && (
            <>
              <button 
                onClick={() => handleAction('UPDATE_GUESTS')}
                className="w-full rounded-2xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
              >
                UPDATE GUEST COUNT
              </button>
              <button 
                onClick={() => handleAction('CLEAR')}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-100 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut size={18} />
                CLEAR TABLE
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableActionModal;
