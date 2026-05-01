import React, { useState, useEffect } from 'react';
import { X, Users, CheckCircle, Ban, LogOut, ChevronUp, ChevronDown } from 'lucide-react';

const TableActionModal = ({ isOpen, onClose, table, onUpdate }) => {
  const [guestCount, setGuestCount] = useState(1);
  const [loading, setLoading] = useState(false);

  // Sync internal guestCount with the table data whenever the modal opens
  useEffect(() => {
    if (table) {
      setGuestCount(table.currentGuestCount > 0 ? table.currentGuestCount : 1);
    }
  }, [table, isOpen]);

  if (!isOpen || !table) return null;

  // Handlers for Logic
  const handleAction = async (actionType) => {
    setLoading(true);
    // Note: We will connect the actual API calls here in the next step
    console.log(`Action: ${actionType} for Table ${table.id}`);
    
    setTimeout(() => {
      setLoading(false);
      onUpdate(); // Refresh the list
      onClose();   // Close modal
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        
        {/* 1. Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="text-xl font-black text-gray-800">Manage Table {table.tableNumber}</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Status: {table.status}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {/* 2. Guest Counter Section (Only for seating/occupied) */}
          {table.status !== 'RESERVED' && (
            <div className="mb-8 flex flex-col items-center justify-center rounded-2xl bg-gray-50 p-6">
              <span className="mb-2 text-xs font-black uppercase tracking-widest text-gray-400">Current Guests</span>
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  className="rounded-xl bg-white p-3 shadow-sm hover:bg-gray-100 active:scale-90 transition-all"
                >
                  <ChevronDown size={24} className="text-gray-600" />
                </button>
                <span className="text-5xl font-black text-gray-800">{guestCount}</span>
                <button 
                  onClick={() => setGuestCount(Math.min(table.capacity, guestCount + 1))}
                  className="rounded-xl bg-white p-3 shadow-sm hover:bg-gray-100 active:scale-90 transition-all"
                >
                  <ChevronUp size={24} className="text-gray-600" />
                </button>
              </div>
              <span className="mt-4 text-[11px] font-bold text-gray-400 italic">Max Capacity: {table.capacity} People</span>
            </div>
          )}

          {/* 3. Action Buttons Based on Status */}
          <div className="space-y-3">
            
            {/* --- Case: AVAILABLE --- */}
            {table.status === 'AVAILABLE' && (
              <button 
                onClick={() => handleAction('OCCUPY')}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 font-black text-white shadow-lg shadow-green-200 hover:bg-green-700 active:scale-[0.98] transition-all"
              >
                <CheckCircle size={20} />
                START GUEST SESSION
              </button>
            )}

            {/* --- Case: OCCUPIED --- */}
            {table.status === 'OCCUPIED' && (
              <>
                <button 
                  onClick={() => handleAction('UPDATE_GUESTS')}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-black text-white hover:bg-blue-700 transition-all"
                >
                  UPDATE GUEST COUNT
                </button>
                <button 
                  onClick={() => handleAction('CLEAR')}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-100 bg-red-50 py-4 font-black text-red-600 hover:bg-red-100 transition-all"
                >
                  <LogOut size={20} />
                  CLEAR & FINALIZE TABLE
                </button>
              </>
            )}

            {/* --- Case: RESERVED --- */}
            {table.status === 'RESERVED' && (
              <>
                <button 
                  onClick={() => handleAction('OCCUPY')}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-black text-white hover:bg-blue-700 transition-all"
                >
                  CHECK-IN RESERVED GUEST
                </button>
                <button 
                  onClick={() => handleAction('CANCEL_RESERVATION')}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-100 py-4 font-black text-gray-600 hover:bg-gray-200 transition-all"
                >
                  <Ban size={20} />
                  CANCEL RESERVATION
                </button>
              </>
            )}
          </div>
        </div>

        {/* 4. Order Warning Badge */}
        {table.activeOrderCount > 0 && table.status === 'OCCUPIED' && (
          <div className="bg-orange-50 p-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">
              ⚠️ Warning: This table has {table.activeOrderCount} live orders!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableActionModal;
