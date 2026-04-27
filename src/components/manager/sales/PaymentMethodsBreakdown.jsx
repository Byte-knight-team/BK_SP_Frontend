import React from 'react'
import { CreditCard, Banknote, MapPin, Utensils } from 'lucide-react'

function PaymentCard({ title, amount, sublabel, icon: Icon }) {
  return (
    <div className="flex-1 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-125"></div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-brand-light rounded-xl group-hover:rotate-6 transition-transform">
          <Icon className="w-6 h-6 text-brand" />
        </div>
        <h4 className="text-lg font-extrabold text-gray-900 tracking-tight">{title}</h4>
      </div>
      
      <h3 className="text-3xl font-black text-gray-900 mb-2">Rs. {amount.toLocaleString()}</h3>
      <p className="text-sm text-gray-400 font-medium">{sublabel}</p>
    </div>
  )
}

function SourceItem({ label, amount, icon: Icon }) {
  return (
    <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:bg-brand transition-all">
          <Icon className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
        </div>
        <span className="text-base font-bold text-gray-700">{label}</span>
      </div>
      <span className="text-xl font-black text-gray-900 tracking-tight">Rs. {amount.toLocaleString()}</span>
    </div>
  )
}

export default function PaymentMethodsBreakdown({ cardTotal, cashTotal, dineIn, delivery }) {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-10 space-y-12">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-brand-light rounded-xl">
          <Banknote className="w-6 h-6 text-brand" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Payment Methods</h2>
      </div>

      {/* Main Payment Cards */}
      <div className="flex flex-col md:flex-row gap-8">
        <PaymentCard 
          title="Card Payments"
          amount={cardTotal}
          sublabel="Includes Debit & Credit Card Payments"
          icon={CreditCard}
        />
        <PaymentCard 
          title="Cash on Delivery / Dine-in"
          amount={cashTotal}
          sublabel="Physical cash collected"
          icon={Banknote}
        />
      </div>

      {/* Breakdown by Source */}
      <div className="pt-10 border-t border-gray-50">
        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Breakdown by Source</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SourceItem label="Dine-in Orders" amount={dineIn} icon={Utensils} />
          <SourceItem label="Delivery" amount={delivery} icon={MapPin} />
        </div>
      </div>
    </div>
  )
}
