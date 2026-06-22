import React from 'react'
import { DollarSign, Wallet, RefreshCcw } from 'lucide-react'

function SummaryCard({ icon, iconBg, label, value, valueColor, subtitle }) {
  return (
    <div className="card flex items-start justify-between text-left w-full">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={`text-3xl font-extrabold mt-2 ${valueColor || 'text-gray-900'}`}>
          {value}
        </p>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-xl ${iconBg}`}>{icon}</div>
    </div>
  )
}

export default function FinancialStatsGrid({ gross, net, refunds }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <SummaryCard 
        label="Gross Sales"
        value={`Rs. ${gross.toLocaleString()}`}
        subtitle="Total value before deductions"
        icon={<DollarSign className="w-6 h-6 text-brand" />}
        iconBg="bg-brand-light"
      />
      <SummaryCard 
        label="Net Sales"
        value={`Rs. ${net.toLocaleString()}`}
        subtitle="Total after discounts & refunds"
        icon={<Wallet className="w-6 h-6 text-blue-600" />}
        iconBg="bg-blue-50"
      />
      <SummaryCard 
        label="Total Refunds"
        value={`Rs. ${refunds.toLocaleString()}`}
        valueColor="text-red-500"
        subtitle="Money sent back to customers"
        icon={<RefreshCcw className="w-6 h-6 text-red-500" />}
        iconBg="bg-red-50"
      />
    </div>
  )
}
