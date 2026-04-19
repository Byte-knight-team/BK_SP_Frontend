import React from 'react'
import OrderStepper from '../OrderStepper'
import MealTable from '../dashboard/MealTable'


const mealsData = [
  { name: "Mixed Fried Rice", category: "Rice", qty: 2, status: "Pending" },
  { name: "Chicken Kottu", category: "Kottu", qty: 1, status: "pending" },
  { name: "Signature Burger", category: "Burger", qty: 1, status: "Pending" },
];

const SelectedOrder = ({ orderId }) => {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      {/* header section */}
      <div className="flex items-start justify-between">
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Order #ORD-1200</h1>
      <p className="text-sm text-gray-400 mt-1">Placed on 2/16/2026 at 10:28 AM • Dine-in</p>
    </div>
    <div className="flex gap-3">
      <span className="rounded-full bg-orange-50 px-4 py-1 text-xs font-bold text-orange-500 uppercase">Awaiting Preparation</span>
      <button className="flex items-center gap-1 rounded-full border border-red-100 px-4 py-1 text-xs font-bold text-red-500 hover:bg-red-50">
        Cancel Order
      </button>
    </div>
  </div>
      {/* progress bar section */}
      <div>
        <OrderStepper currentStatus="preparing" />
      </div>

      {/* meal table */}
      <div>
        <MealTable meals={mealsData} />
      </div>
    </div>
  )
}

export default SelectedOrder
