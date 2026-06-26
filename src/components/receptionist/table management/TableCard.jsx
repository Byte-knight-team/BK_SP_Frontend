import React from 'react'
import { Users, Armchair, Clock, CookingPot } from 'lucide-react'

const TableCard = ({ table, onClick }) => {

  // helper function to format status colors and labels
  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          badgeColor: 'bg-green-500',
          label: 'Available',
        }
      case 'OCCUPIED':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          badgeColor: 'bg-red-500',
          label: 'Occupied',
        }

      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          badgeColor: 'bg-gray-500',
          label: 'Unknown',
        }
    }
  }

  const config = getStatusConfig(table.status);

  // Simple helper to format the backend time string (e.g., '8:30 PM')
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return null;
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div
      onClick={() => onClick(table)}
      className={`cursor-pointer rounded-3xl border-2 ${config.borderColor} ${config.bgColor} p-4 transition-all hover:shadow-md`}
    >
      {/* Top Row: Table Number & ID */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
            Table ID: #{table.id}
          </span>
          <h3 className={`text-2xl font-black ${config.textColor}`}>
            Table {table.tableNumber}
          </h3>
        </div>

        {/* Current Guest Count / Capacity */}
        <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-sm font-black text-gray-700 shadow-sm">
          <Armchair size={18} />
          <span>
            {table.currentGuestCount} / {table.capacity}
          </span>
        </div>
      </div>

      {/* Main Status Badge */}
      <div className="my-6 flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${config.badgeColor}`} />
        <span
          className={`text-base font-black tracking-tight uppercase ${config.textColor}`}
        >
          {config.label}
        </span>
      </div>

      {/* Info Section: Shows Seating Details or Upcoming Bookings */}
      <div className="space-y-4">

        {/* Details for AVAILABLE tables */}
        {table.status === 'AVAILABLE' && (
          <div className="text-sm font-bold text-green-600 italic">
            Ready to Seat
          </div>
        )}

        {/* Details for OCCUPIED tables */}
        {table.status === 'OCCUPIED' && (
          <>
            <div className="flex items-center gap-3 text-base font-bold text-gray-700">
              <Users size={20} className="text-red-400" />
              <span>{table.currentGuestCount} Guests Seated</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
              <Clock size={18} />
              {/* Show when the status was last changed */}
              <span>Seated Since: {formatTime(table.statusUpdatedAt)}</span>
            </div>
          </>
        )}
      </div>

      {/* Footer: Order Indicator (if active orders exist) */}
      <div className="mt-6 flex items-center">
        {table.activeOrderCount > 0 && (
          <div className="flex items-center gap-2">
            <CookingPot size={20} className="text-orange-500" />
            <span className="text-sm font-black text-orange-600">
              {table.activeOrderCount} Active Orders
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default TableCard
