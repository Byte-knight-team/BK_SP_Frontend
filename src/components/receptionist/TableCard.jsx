import React from 'react';
import { Users, Armchair, Clock, CookingPot, Circle } from 'lucide-react';

/**
 * TableCard Component
 * Displays real-time status and details of a single restaurant table.
 * 
 * Props:
 * - table: The table object from backend (id, tableNumber, capacity, status, etc.)
 * - onClick: Function to open the management modal
 */
const TableCard = ({ table, onClick }) => {
  
  // 1. Logic for Status Colors & Styling
  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          badgeColor: 'bg-green-500',
          label: 'Available'
        };
      case 'OCCUPIED':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          badgeColor: 'bg-red-500',
          label: 'Occupied'
        };
      case 'RESERVED':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          badgeColor: 'bg-blue-500',
          label: 'Reserved'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          badgeColor: 'bg-gray-500',
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig(table.status);

  return (
    <div 
      onClick={() => onClick(table)}
      className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-5 transition-all hover:shadow-lg active:scale-95`}
    >
      {/* Top Row: Identification */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Table ID: #{table.id}
          </span>
          <h3 className={`text-2xl font-black ${config.textColor}`}>
            Table {table.tableNumber}
          </h3>
        </div>
        
        {/* Capacity Indicator */}
        <div className="flex items-center gap-1 rounded-lg bg-white/60 px-2 py-1 text-sm font-bold text-gray-600">
          <Armchair size={16} />
          <span>{table.capacity}</span>
        </div>
      </div>

      {/* Middle: Status Badge */}
      <div className="my-6 flex items-center gap-2">
        <div className={`h-2.5 w-2.5 animate-pulse rounded-full ${config.badgeColor}`} />
        <span className={`text-sm font-black uppercase tracking-tight ${config.textColor}`}>
          {config.label}
        </span>
      </div>

      {/* Main Info Section */}
      <div className="space-y-3">
        {/* Case 1: Occupied Details */}
        {table.status === 'OCCUPIED' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <Users size={18} className="text-red-400" />
              <span>{table.currentGuestCount} Guests Seated</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
              <Clock size={14} />
              <span>Seated 20 mins ago</span> {/* We will make this dynamic later */}
            </div>
          </div>
        )}

        {/* Case 2: Available / Reserved Text */}
        {table.status !== 'OCCUPIED' && (
          <div className="text-sm font-medium text-gray-500 italic">
            {table.status === 'RESERVED' ? 'Reserved for 7:30 PM' : 'Ready for next guest'}
          </div>
        )}
      </div>

      {/* --- Bottom Footer: Order Pulse --- */}
      <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-3">
        <div className="flex items-center gap-1.5">
          {table.activeOrderCount > 0 ? (
            <>
              <CookingPot size={16} className="text-orange-500" />
              <span className="text-xs font-black text-orange-600">
                {table.activeOrderCount} Active Orders
              </span>
            </>
          ) : (
            <span className="text-[10px] font-bold text-gray-400">No active orders</span>
          )}
        </div>
        
        <div className="rounded-full bg-white/80 p-1">
          <Circle size={12} className="text-gray-300" />
        </div>
      </div>
    </div>
  );
};

export default TableCard;
