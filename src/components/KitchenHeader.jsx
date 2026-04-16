import React from 'react';
import { Bell, Search } from 'lucide-react'; 

const KitchenHeader = () => {
  return (
    <div className="flex   bg-white p-4 rounded-2xl shadow-sm mb-8 border border-gray-100">
      
      {/* 1. Welcome Message */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Hello, Isuru! 👋</h2>
        <p className="text-sm text-gray-500 font-medium">Ready to lead the kitchen?</p>
      </div>

      {/* 2. Search Bar */}
      <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl w-1/3">
        <Search className="text-gray-400 mr-2" size={18} />
        <input 
          type="text" 
          placeholder="Search orders, ingredients..." 
          className="bg-transparent border-none outline-none text-sm w-full"
        />
      </div>

      {/* 3. Notification & Profile */}
      <div className="flex items-center gap-4">
        <button className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 relative">
          <Bell className="text-gray-600" size={22} />
          <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        
        <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
          I
        </div>
      </div>

    </div>
  );
};

export default KitchenHeader;