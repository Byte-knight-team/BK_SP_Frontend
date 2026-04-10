import React, { useState, useRef } from 'react';
import {
  Search, Bell, HelpCircle, Settings, ArrowLeft, Upload, CheckCircle2, CircleDot
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

export default function EditMenuItemPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [itemName, setItemName] = useState('Pepperoni Pizza');
  const [category, setCategory] = useState('');
  const [basePrice, setBasePrice] = useState('1650');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('Active');
  const [imagePreview, setImagePreview] = useState('https://images.unsplash.com/photo-1628840042765-356cda07504e?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVwcGVyb25pJTIwcGl6emF8ZW58MHx8MHx8fDA=');
  const [imageFile, setImageFile] = useState(null);

  const visibilityOptions = [
    { label: 'Active', color: 'text-gray-700' },
    { label: 'Out of Stock', color: 'text-gray-700' },
    { label: 'Draft', color: 'text-orange-500' },
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    // TODO: Hook up to backend API
    console.log({ itemName, category, basePrice, description, visibility, imageFile });
    navigate('/admin/menu');
  };

  const handleCancel = () => {
    navigate('/admin/menu');
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
        {/* Header */}
        <header className="px-10 py-6 flex items-center justify-between sticky top-0 z-20 bg-[#FAFAFA]">
          <div className="flex items-center bg-white border border-gray-100 rounded-2xl px-4 py-2.5 w-full max-w-md shadow-sm">
            <Search size={18} className="text-gray-400 mr-3 hidden sm:block" />
            <input type="text" placeholder="Quick search across modules..." className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400" />
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
              <Bell size={22} />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-[#FAFAFA]"></div>
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <HelpCircle size={22} />
            </button>
            <button className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
              <Settings size={16} />
              System Panel
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-10 pb-10">

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/menu')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Menu Item</h1>
                <p className="text-gray-500 text-sm mt-1">Configure item details, variants, and availability</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 py-2.5 rounded-xl border border-gray-200 text-sm transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

            {/* Left Column - General Information */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <CircleDot size={16} className="text-orange-500" />
                </div>
                <h2 className="text-base font-bold text-gray-900">General Information</h2>
              </div>

              {/* Item Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Classic Cheeseburger"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>

              {/* Category & Base Price */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select category</option>
                    <option value="Burgers">Burgers</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Salads">Salads</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Base Price (LKR)</label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your dish..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">

              {/* Item Image */}
              <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Item Image</h2>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full aspect-square object-cover rounded-2xl" />
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl w-full p-6 flex flex-col items-center justify-center min-h-[180px] group-hover:border-orange-300 group-hover:bg-orange-50/30 transition-all">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-orange-50 transition-colors">
                        <Upload size={24} className="text-gray-400 group-hover:text-orange-400 transition-colors" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">Upload high-res PNG/JPG</p>
                      <p className="text-xs text-gray-400 mt-1">Min. 600x600px suggested</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Visibility */}
              <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Visibility</h2>
                <div className="flex flex-col gap-1">
                  {visibilityOptions.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setVisibility(option.label)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        visibility === option.label
                          ? 'bg-orange-50 text-orange-500 border border-orange-200'
                          : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <span>{option.label}</span>
                      {visibility === option.label && (
                        <CheckCircle2 size={18} className="text-orange-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
