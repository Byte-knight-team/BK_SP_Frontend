import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Shield, ChevronDown, ChevronUp, Save, Check } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

export default function AddNewUserPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    status: 'ACTIVE',
    role: 'Chief Chef'
  });
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const roles = [
    'Admin',
    'Manager',
    'Receptionist',
    'Chief Chef',
    'Delivery Driver'
  ];

  const handleSave = (e) => {
    e.preventDefault();
    // In a real app we would save to backend here
    navigate('/admin/users');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans">
      <AdminSidebar activePage="/admin/users" />

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
        <AdminHeader />

        <div className="flex-1 overflow-y-auto p-10 flex justify-center">
          
          <div className="bg-white rounded-[2rem] w-full max-w-4xl p-12 shadow-sm border border-gray-100 h-fit">
            <h1 className="text-3xl font-bold text-gray-900 mb-10 tracking-tight">Register New Staff</h1>
            
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-x-8 gap-y-8 relative">
              
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-300" />
                  </div>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="e.g. Ashen Randira"
                    className="w-full bg-[#F8F9FA] border-none text-gray-800 text-sm rounded-2xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-orange-100 transition-shadow outline-none placeholder-gray-400 font-medium"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-300" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="e.g. ashen@cravehouse.com"
                    className="w-full bg-[#F8F9FA] border-none text-gray-800 text-sm rounded-2xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-orange-100 transition-shadow outline-none placeholder-gray-400 font-medium"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone size={18} className="text-gray-300" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="e.g. +94 77 123 4567"
                    className="w-full bg-[#F8F9FA] border-none text-gray-800 text-sm rounded-2xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-orange-100 transition-shadow outline-none placeholder-gray-400 font-medium"
                  />
                </div>
              </div>

              {/* Account Status */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Account Status
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, status: 'ACTIVE'})}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-colors ${
                      formData.status === 'ACTIVE' 
                      ? 'bg-green-50 text-green-600 border border-green-100/50' 
                      : 'bg-[#F8F9FA] text-gray-400 border border-transparent'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${formData.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, status: 'INACTIVE'})}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-colors ${
                      formData.status === 'INACTIVE' 
                      ? 'bg-gray-100 text-gray-600 border border-gray-200' 
                      : 'bg-[#F8F9FA] text-gray-400 border border-transparent'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${formData.status === 'INACTIVE' ? 'bg-gray-500' : 'bg-gray-300'}`}></span>
                    Inactive
                  </button>
                </div>
              </div>

              {/* Designated Role (Dropdown Wrapper) */}
              <div className="col-span-1 relative z-10" ref={dropdownRef}>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Designated Role
                </label>
                <div 
                  className={`relative flex items-center justify-between w-full bg-white border cursor-pointer hover:border-gray-300 text-sm rounded-2xl px-4 py-3.5 transition-colors font-bold text-gray-800 ${isDropdownOpen ? 'border-gray-800 ring-1 ring-gray-800' : 'border-gray-200'}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-gray-900" />
                    {formData.role}
                  </div>
                  {isDropdownOpen ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-[85px] left-0 w-[300px] bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden py-2 z-20">
                    {roles.map((role) => (
                      <div
                        key={role}
                        className={`px-4 py-3 flex items-center justify-between cursor-pointer text-sm font-bold transition-colors ${
                          formData.role === role ? 'bg-[#D2E3FF] text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setFormData({...formData, role: role});
                          setIsDropdownOpen(false);
                        }}
                      >
                        {role}
                        {formData.role === role && <Check size={16} className="text-gray-900" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button Wrapper */}
              <div className="col-span-1 flex items-end justify-end">
                <button
                  type="submit"
                  className="bg-[#FF6B00] hover:bg-[#e66000] text-white px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/30 transition-transform active:scale-95"
                >
                  <Save size={18} />
                  SAVE USER PROFILE
                </button>
              </div>

            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
