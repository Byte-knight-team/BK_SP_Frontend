import { useState, useEffect } from 'react';
import { X, LogOut, ChevronUp, ChevronDown, LayoutGrid, ClipboardList, Loader2 } from 'lucide-react';
import { 
  occupyTableAPI, 
  clearTableAPI 
} from '../../../apis/receptionist/tables';
import { toast } from 'react-toastify';

const TableActionModal = ({ isOpen, onClose, table, onUpdate }) => {
  const [guestCount, setGuestCount] = useState(1);
  const [loading, setLoading] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (table) {
      setGuestCount(table.currentGuestCount > 0 ? table.currentGuestCount : 1);
    }
  }, [table, isOpen]);
  if (!isOpen || !table) return null;

  // This function handles all the different API calls
  const handleAction = async (actionType) => {
    setLoading(true);
    let response;

    switch (actionType) {
      case 'OCCUPY':
        response = await occupyTableAPI(table.id, guestCount);
        break;
      case 'CLEAR':
        response = await clearTableAPI(table.id);
        break;
      default:
        break;
    }

    if (response?.error) {
      toast.error(response.error);
    } else {
      toast.success("Table status updated!");
      onUpdate(); // Refresh the floor map
      onClose();  // Close modal
    }
    setLoading(false);
  };



  const getModalTitle = () => {
    if (table.status === 'AVAILABLE') return `Seating Table ${table.tableNumber}`;
    if (table.status === 'OCCUPIED') return `Manage Table ${table.tableNumber}`;
    return `Table ${table.tableNumber}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-4xl bg-white p-8 shadow-2xl">
        
        {/* Header Section */}
        <div className="mb-6 flex items-start justify-between">
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
            <LayoutGrid size={24} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900">{getModalTitle()}</h3>
        <div className="mb-6 mt-4 h-px w-full bg-gray-100" />

        {/* --- CASE 1: AVAILABLE or OCCUPIED (Manage Guests) --- */}
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

        {/* --- CASE: OCCUPIED (Order List) --- */}
        {table.status === 'OCCUPIED' && table.activeOrderCount > 0 && (
          <div className="mb-6 rounded-2xl bg-orange-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600">
              <ClipboardList size={14} />
              Active Orders
            </div>
            <div className="flex flex-wrap gap-2">
              {table.activeOrderIds && table.activeOrderIds.length > 0 ? (
                table.activeOrderIds.map((orderId, idx) => (
                  <span key={idx} className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-gray-600 shadow-sm">
                    {orderId}
                  </span>
                ))
              ) : (
                <span className="text-xs font-bold text-gray-400 italic">Orders syncing...</span>
              )}
            </div>
          </div>
        )}



        {/* --- ACTION BUTTONS --- */}
        <div className="space-y-3">
          
          {/* AVAILABLE: Confirm seating */}
          {table.status === 'AVAILABLE' && (
            <>
              <button 
                onClick={() => handleAction('OCCUPY')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "CONFIRM SEATING"}
              </button>
            </>
          )}

          {/* OCCUPIED: Change guest count or Clear table */}
          {table.status === 'OCCUPIED' && (
            <>
              <button 
                onClick={() => handleAction('OCCUPY')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "UPDATE GUEST COUNT"}
              </button>
              <button 
                onClick={() => handleAction('CLEAR')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-100 py-4 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><LogOut size={18} /> CLEAR TABLE</>}
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default TableActionModal;
