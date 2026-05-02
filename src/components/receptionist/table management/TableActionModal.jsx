import { useState, useEffect } from 'react';
import { X, CheckCircle, Ban, LogOut, ChevronUp, ChevronDown, LayoutGrid, Clock, User, Phone, ClipboardList } from 'lucide-react';

const TableActionModal = ({ isOpen, onClose, table, onUpdate }) => {
  const [guestCount, setGuestCount] = useState(1);
  const [cancelReason, setCancelReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (table) {
      setGuestCount(table.currentGuestCount > 0 ? table.currentGuestCount : 1);
      setCancelReason(""); // Reset reason
    }
  }, [table, isOpen]);

  if (!isOpen || !table) return null;

  const handleAction = async (actionType) => {
    setLoading(true);
    // We will pass cancelReason if the action is CANCEL_RESERVATION
    console.log(`Action: ${actionType} for Table ${table.id}`, actionType === 'CANCEL_RESERVATION' ? { reason: cancelReason } : "");
    
    setTimeout(() => {
      setLoading(false);
      onUpdate();
      onClose();
    }, 800);
  };

  // Helper to determine the Modal Title based on status
  const getModalTitle = () => {
    if (table.status === 'AVAILABLE') return `Seating Table ${table.tableNumber}`;
    if (table.status === 'OCCUPIED') return `Manage Table ${table.tableNumber}`;
    if (table.status === 'RESERVED') return `Reservation: Table ${table.tableNumber}`;
    return `Table ${table.tableNumber}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-4xl bg-white p-8 shadow-2xl">
        
        {/* 1. Header Section */}
        <div className="mb-6 flex items-start justify-between">
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
            <LayoutGrid size={24} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* 2. Dynamic Title & Duration */}
        <h3 className="text-xl font-bold text-gray-900">{getModalTitle()}</h3>
        {table.status === 'OCCUPIED' && (
          <div className="mt-1 flex items-center gap-2 text-sm font-bold text-orange-500">
            <Clock size={14} />
            <span>Seated for 25 mins</span>
          </div>
        )}
        <div className="mb-6 mt-4 h-px w-full bg-gray-100" />

        {/* 3. Context-Aware Content */}
        
        {/* CASE: AVAILABLE or OCCUPIED (Guest Counter) */}
        {(table.status === 'AVAILABLE' || table.status === 'OCCUPIED') && (
          <div className="mb-6">
            <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-gray-400">Number of Guests</label>
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
              <button 
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                className="rounded-xl bg-white p-2 shadow-sm active:scale-90"
              >
                <ChevronDown size={20} />
              </button>
              <span className="text-3xl font-black text-gray-800">{guestCount}</span>
              <button 
                onClick={() => setGuestCount(Math.min(table.capacity, guestCount + 1))}
                className="rounded-xl bg-white p-2 shadow-sm active:scale-90"
              >
                <ChevronUp size={20} />
              </button>
            </div>
          </div>
        )}

        {/* CASE: OCCUPIED (Order List) */}
        {table.status === 'OCCUPIED' && table.activeOrderCount > 0 && (
          <div className="mb-6 rounded-2xl bg-orange-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
              <ClipboardList size={14} />
              Active Orders
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-gray-600 shadow-sm">#ORD-101</span>
              <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-gray-600 shadow-sm">#ORD-105</span>
            </div>
          </div>
        )}

        {/* CASE: RESERVED (Guest Info) */}
        {table.status === 'RESERVED' && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl bg-blue-50 p-4">
              <User size={20} className="text-blue-600" />
              <div>
                <p className="text-[10px] font-black uppercase text-blue-400">Customer</p>
                <p className="text-sm font-bold text-blue-900">John Doe</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
              <Phone size={20} className="text-gray-400" />
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400">Phone</p>
                <p className="text-sm font-bold text-gray-600">+94 77 123 4567</p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Action Buttons */}
        <div className="space-y-3">
          {table.status === 'AVAILABLE' && (
            <button 
              onClick={() => handleAction('OCCUPY')}
              className="w-full rounded-2xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600"
            >
              CONFIRM SEATING
            </button>
          )}

          {table.status === 'OCCUPIED' && (
            <>
              <button 
                onClick={() => handleAction('UPDATE_GUESTS')}
                className="w-full rounded-2xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/20"
              >
                CHANGE GUEST COUNT
              </button>
              <button 
                onClick={() => handleAction('CLEAR')}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-100 py-4 text-sm font-bold text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                CLEAR TABLE
              </button>
            </>
          )}

          {table.status === 'RESERVED' && (
            <>
              <button 
                onClick={() => handleAction('OCCUPY')}
                className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700"
              >
                CHECK-IN GUEST
              </button>
              
              <div className="mt-4 space-y-2">
                <input 
                  type="text" 
                  placeholder="Reason for cancellation..."
                  className="w-full rounded-xl bg-gray-50 p-3 text-xs font-bold text-gray-600 outline-none focus:ring-1 focus:ring-red-200"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
                <button 
                  onClick={() => handleAction('CANCEL_RESERVATION')}
                  disabled={!cancelReason}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-4 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  <Ban size={18} />
                  CANCEL RESERVATION
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default TableActionModal;
