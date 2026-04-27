import React from 'react'
import { TrendingUp, Search, Bell, HelpCircle } from 'lucide-react'

export default function SalesSummaryHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      {/* Title Section */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-brand-light rounded-2xl">
          <TrendingUp className="w-8 h-8 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Sales & Financials
          </h1>
          <p className="text-sm text-gray-400 font-medium">
            Detailed breakdown for accounting & reconciliation
          </p>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-6 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 w-64 group focus-within:ring-2 focus-within:ring-brand/10 transition-all">
          <Search className="w-4 h-4 text-gray-400 group-focus-within:text-brand transition-colors" />
          <input 
            type="text" 
            placeholder="Quick search across modules..." 
            className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder:text-gray-300"
          />
        </div>
        
        <div className="flex items-center gap-4 px-2 border-l border-gray-100">
          <button className="p-2 text-gray-400 hover:text-brand hover:bg-brand-light rounded-lg transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 text-gray-400 hover:text-brand hover:bg-brand-light rounded-lg transition-all">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
          <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          System Panel
        </button>
      </div>
    </div>
  )
}
