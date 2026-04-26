import React from 'react';
import { Search, Bell, HelpCircle, Settings } from 'lucide-react';

export default function AdminHeader() {
  return (
    <header className="px-10 py-6 flex items-center justify-between sticky top-0 z-20 bg-[#FAFAFA]">
      <div className="flex items-center bg-white border border-gray-100 rounded-2xl px-4 py-2.5 w-full max-w-md shadow-sm">
        <Search size={18} className="text-gray-400 mr-3 hidden sm:block" />
        <input type="text" placeholder="Quick search across modules..." className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400" />
        <div className="text-gray-300 ml-auto hidden sm:block font-light text-xl"></div>
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
  );
}
