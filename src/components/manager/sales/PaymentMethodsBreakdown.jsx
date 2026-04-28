import React from 'react'
import { CreditCard, Banknote, MapPin, Utensils } from 'lucide-react'

function PaymentCard({ title, amount, sublabel, icon: Icon }) {
  return (
    <div className="flex-1 card flex flex-col gap-4 hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-brand-light rounded-xl">
          <Icon className="w-6 h-6 text-brand" />
        </div>
        <h4 className="text-lg font-bold text-gray-900">{title}</h4>
      </div>
      
      <div>
        <h3 className="text-3xl font-extrabold text-gray-900">Rs. {amount.toLocaleString()}</h3>
        <p className="text-sm text-gray-400 mt-1">{sublabel}</p>
      </div>
    </div>
  )
}

function SourceItem({ label, amount, icon: Icon }) {
  return (
    <div className="flex items-center justify-between p-5 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
          <Icon className="w-5 h-5 text-gray-500" />
        </div>
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <span className="text-lg font-bold text-gray-900">Rs. {amount.toLocaleString()}</span>
    </div>
  )
}

export default function PaymentMethodsBreakdown({ cardTotal, cashTotal, dineIn, delivery }) {
  return (
    <div className="card space-y-10">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-brand-light rounded-xl">
          <Banknote className="w-6 h-6 text-brand" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
      </div>

      {/* Main Payment Cards */}
      <div className="flex flex-col md:flex-row gap-5">
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
      <div className="pt-8 border-t border-gray-50">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Breakdown by Source</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SourceItem label="Dine-in Orders" amount={dineIn} icon={Utensils} />
          <SourceItem label="Delivery" amount={delivery} icon={MapPin} />
        </div>
      </div>
    </div>
  )
}
