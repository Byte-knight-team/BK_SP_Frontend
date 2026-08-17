import React, { useEffect, useState } from 'react';
import { Hash, Save, Users, X } from 'lucide-react';
import { authFetch } from '../../../apis/apiHelper';

const DEFAULT_FORM_DATA = {
  tableNumber: '01',
  seatingCapacity: '1',
};

export default function AddTableModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(DEFAULT_FORM_DATA);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const response = await authFetch(`${baseUrl}/api/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNumber: parseInt(formData.tableNumber),
          capacity: parseInt(formData.seatingCapacity),
          branchId: 1,
        }),
      });

      if (response.ok) {
        if (onCreated) {
          await onCreated();
        }
        onClose();
      }
    } catch (error) {
      console.error('Error creating table:', error);
      alert(error.message || 'Failed to create table. Please check your data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6" onClick={onClose}>
      <div className="w-full max-w-[640px] overflow-hidden rounded-[20px] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-gray-900">Add New Table</h1>
            <p className="mt-1 text-[13px] font-medium text-gray-500">Configure table details</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
            aria-label="Close add table modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-[#FAFAFA] px-5 py-5 sm:px-6 sm:py-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <Hash size={13} className="mr-1.5" />
                TABLE NUMBER
              </label>
              <input
                type="number"
                name="tableNumber"
                value={formData.tableNumber}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-[14px] text-gray-900 transition-colors placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="Enter table number (e.g. 9)"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <Users size={13} className="mr-1.5" />
                SEATING CAPACITY
              </label>
              <input
                type="number"
                name="seatingCapacity"
                value={formData.seatingCapacity}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-[14px] text-gray-900 transition-colors placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="Enter capacity"
              />
            </div>
          </div>

          <div className="border-t border-gray-50 pt-6">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-[#FF6B00] px-6 py-2.5 text-[14px] font-semibold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[#e66000] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={16} />
                {isSubmitting ? 'Saving...' : 'Add Table'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}