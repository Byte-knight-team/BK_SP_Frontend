import React, { useState } from 'react';
import { ArrowLeft, Hash, Users, MapPin, Save, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function AddTablePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tableNumber: '01',
    seatingCapacity: '1',
    zone: 'Indoor - Main',
    status: 'Available'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNumber: parseInt(formData.tableNumber),
          capacity: parseInt(formData.seatingCapacity),
          status: formData.status.toUpperCase(),
          branchId: 1 // Default branch since zone mapper isn't implemented
        })
      });

      if (response.ok) {
        navigate('/admin/tables');
      } else {
        const errorData = await response.json();
        alert(errorData.message || errorData.error || 'Failed to create table. Please check your data.');
      }
    } catch (error) {
      console.error('Error creating table:', error);
      alert('Network error. Could not connect to the backend server.');
    }
  };

  return (
    <div className="bg-[#FAFAFA] font-sans px-10 pb-10">
          <div className="mb-6 mt-6">
            <Link to="/admin/tables" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Back to Tables
            </Link>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-[24px] p-10 max-w-[850px]">
            <div className="mb-10">
              <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">Add New Table</h1>
              <p className="text-gray-500 text-[15px] mt-1.5 font-medium">Configure table details and floor assignment</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Table Number */}
                <div className="space-y-2.5">
                  <label className="flex items-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <Hash size={14} className="mr-1.5" />
                    TABLE NUMBER
                  </label>
                  <input
                    type="number"
                    name="tableNumber"
                    value={formData.tableNumber}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors placeholder-gray-400"
                    placeholder="Enter table number (e.g. 9)"
                  />
                </div>

                {/* Seating Capacity */}
                <div className="space-y-2.5">
                  <label className="flex items-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <Users size={14} className="mr-1.5" />
                    SEATING CAPACITY
                  </label>
                  <input
                    type="number"
                    name="seatingCapacity"
                    value={formData.seatingCapacity}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors placeholder-gray-400"
                    placeholder="Enter capacity"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Zone / Location */}
                <div className="space-y-2.5">
                  <label className="flex items-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <MapPin size={14} className="mr-1.5" />
                    ZONE / LOCATION
                  </label>
                  <div className="relative">
                    <select
                      name="zone"
                      value={formData.zone}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="Indoor - Main">Indoor - Main</option>
                      <option value="Outdoor - Terrace">Outdoor - Terrace</option>
                      <option value="VIP Lounge">VIP Lounge</option>
                      <option value="Indoor - Window">Indoor - Window</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2.5">
                  <label className="block flex items-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    STATUS
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Reserved">Reserved</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-8 mt-10">
                <div className="flex justify-end items-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/tables')}
                    className="px-6 py-3 rounded-xl border border-gray-200 text-[15px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#FF6B00] hover:bg-[#e66000] text-white px-8 py-3 rounded-xl font-semibold text-[15px] flex items-center gap-2 shadow-md shadow-orange-500/20 transition-all"
                  >
                    <Save size={18} />
                    Add Table
                  </button>
                </div>
              </div>
            </form>
          </div>
    </div>
  );
}
