import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Users, CheckCircle } from 'lucide-react';

const ReservationModal = ({ isOpen, onClose, tables, onSave }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    reservationDate: '',
    reservationTime: '',
    guestCount: 1,
    tableId: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving Reservation:", formData);
    // We will connect this to the Backend API later
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-gray-50">
          <div>
            <h2 className="text-xl font-black text-gray-800">New Table Reservation</h2>
            <p className="text-xs font-bold text-gray-400 uppercase">Secure a spot for your guests</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-white p-2 text-gray-500 hover:bg-gray-100 shadow-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Customer Name */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase text-gray-400">Customer Name</label>
              <div className="relative">
                <User className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="Enter full name"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 py-4 pr-4 pl-12 font-bold focus:border-black focus:bg-white focus:outline-none transition-all"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase text-gray-400">Phone Number</label>
              <div className="relative">
                <Phone className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="tel" 
                  required
                  placeholder="+94 77 123 4567"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 py-4 pr-4 pl-12 font-bold focus:border-black focus:bg-white focus:outline-none transition-all"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="mb-2 block text-xs font-black uppercase text-gray-400">Date</label>
              <div className="relative">
                <Calendar className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="date" 
                  required
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 py-4 pr-4 pl-12 font-bold focus:border-black focus:bg-white focus:outline-none transition-all"
                  value={formData.reservationDate}
                  onChange={(e) => setFormData({...formData, reservationDate: e.target.value})}
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="mb-2 block text-xs font-black uppercase text-gray-400">Time</label>
              <div className="relative">
                <Clock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="time" 
                  required
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 py-4 pr-4 pl-12 font-bold focus:border-black focus:bg-white focus:outline-none transition-all"
                  value={formData.reservationTime}
                  onChange={(e) => setFormData({...formData, reservationTime: e.target.value})}
                />
              </div>
            </div>

            {/* Guest Count */}
            <div>
              <label className="mb-2 block text-xs font-black uppercase text-gray-400">Guests</label>
              <div className="relative">
                <Users className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="number" 
                  min="1"
                  required
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 py-4 pr-4 pl-12 font-bold focus:border-black focus:bg-white focus:outline-none transition-all"
                  value={formData.guestCount}
                  onChange={(e) => setFormData({...formData, guestCount: e.target.value})}
                />
              </div>
            </div>

            {/* Table Selection */}
            <div>
              <label className="mb-2 block text-xs font-black uppercase text-gray-400">Assign Table</label>
              <select 
                required
                className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 py-4 px-4 font-bold focus:border-black focus:bg-white focus:outline-none transition-all appearance-none"
                value={formData.tableId}
                onChange={(e) => setFormData({...formData, tableId: e.target.value})}
              >
                <option value="">Select a Table</option>
                {tables.map(t => (
                  <option key={t.id} value={t.id}>
                    Table {t.tableNumber} ({t.capacity} Seats)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            className="mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-5 font-black text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            <CheckCircle size={20} />
            CONFIRM RESERVATION
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;
