import React from 'react'
import { DollarSign, Wallet, RefreshCcw } from 'lucide-react'

function StatCard({ label, amount, sublabel, icon: Icon, variant = 'default' }) {
  const isRefund = variant === 'danger'
  
  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Decorative Gradient Background */}
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 ${isRefund ? 'bg-red-500' : 'bg-brand'}`}></div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-2">{label}</p>
          <h3 className={`text-4xl font-black ${isRefund ? 'text-red-500' : 'text-gray-900'} tracking-tight`}>
            {isRefund && '-'}Rs. {amount.toLocaleString()}
          </h3>
        </div>
        <div className={`p-4 rounded-2xl ${isRefund ? 'bg-red-50' : 'bg-orange-50'}`}>
          <Icon className={`w-8 h-8 ${isRefund ? 'text-red-500' : 'text-orange-500'}`} />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${isRefund ? 'bg-red-400' : 'bg-gray-300'}`}></div>
        <p className="text-sm text-gray-400 font-medium">{sublabel}</p>
      </div>
    </div>
  )
}

export default function FinancialStatsGrid({ gross, net, refunds }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        label="Gross Sales"
        amount={gross}
        sublabel="Total value before deductions"
        icon={DollarSign}
      />
      <StatCard 
        label="Net Sales"
        amount={net}
        sublabel="Total after discounts & refunds"
        icon={Wallet}
      />
      <StatCard 
        label="Total Refunds"
        amount={refunds}
        sublabel="Money sent back to customers"
        icon={RefreshCcw}
        variant="danger"
      />
    </div>
  )
}
