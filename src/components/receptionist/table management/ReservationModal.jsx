import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Users, CheckCircle, PlusCircle, Armchair } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-4xl bg-white p-8 shadow-2xl">
        
        {/* Header Section */}
        <div className="mb-8 flex items-start justify-between">
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
            <PlusCircle size={24} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <h3 className="mb-2 text-2xl font-bold text-gray-900">New Reservation</h3>
        <p className="mb-8 text-sm text-gray-400 font-medium">Please fill in the details below to book a table.</p>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); onClose(); }} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            
            {/* Name */}
            <div className="col-span-2">
              <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-widest">Customer Name</label>
              <input 
                type="text" required
                placeholder="Ex: John Doe"
                className="w-full rounded-2xl border-none bg-gray-50 p-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              />
            </div>

            {/* Phone */}
            <div className="col-span-2">
              <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
              <input 
                type="tel" required
                placeholder="+94 77 123 4567"
                className="w-full rounded-2xl border-none bg-gray-50 p-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                value={formData.customerPhone}
                onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
              />
            </div>

            {/* Date & Time */}
            <div className="col-span-1">
              <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-widest">Date</label>
              <input 
                type="date" required
                className="w-full rounded-2xl border-none bg-gray-50 p-4 text-sm font-bold text-gray-700 outline-none"
                value={formData.reservationDate}
                onChange={(e) => setFormData({...formData, reservationDate: e.target.value})}
              />
            </div>
            <div className="col-span-1">
              <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-widest">Time</label>
              <input 
                type="time" required
                className="w-full rounded-2xl border-none bg-gray-50 p-4 text-sm font-bold text-gray-700 outline-none"
                value={formData.reservationTime}
                onChange={(e) => setFormData({...formData, reservationTime: e.target.value})}
              />
            </div>

            {/* Guest Count */}
            <div className="col-span-1">
              <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-widest">Guests</label>
              <input 
                type="number" min="1" required
                className="w-full rounded-2xl border-none bg-gray-50 p-4 text-sm font-bold text-gray-700 outline-none"
                value={formData.guestCount}
                onChange={(e) => setFormData({...formData, guestCount: e.target.value})}
              />
            </div>

            {/* Table Selection */}
            <div className="col-span-1">
              <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-widest">Assign Table</label>
              <select 
                required
                className="w-full rounded-2xl border-none bg-gray-50 p-4 text-sm font-bold text-gray-700 outline-none"
                value={formData.tableId}
                onChange={(e) => setFormData({...formData, tableId: e.target.value})}
              >
                <option value="">Select Table</option>
                {tables.map(t => (
                  <option key={t.id} value={t.id}>Table {t.tableNumber} ({t.capacity} Seats)</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all"
          >
            <CheckCircle size={18} />
            CONFIRM BOOKING
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;
