import React from 'react'
import { Award, TrendingUp } from 'lucide-react'

/**
 * Table showing the top-performing menu items by quantity and revenue.
 */
export default function TopSellingItemsTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card flex min-h-[300px] flex-col items-center justify-center text-center">
        <p className="text-gray-400">No sales data available for this period</p>
      </div>
    )
  }

  const formatCurrency = (val) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

  return (
    <div className="card h-full">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
            <Award className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Top Selling Items</h3>
            <p className="text-xs font-medium text-gray-400">Highest performing menu items</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <th className="pb-3 pl-2">Item</th>
              <th className="pb-3 text-center">Qty</th>
              <th className="pb-3 text-right pr-2">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item, idx) => (
              <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                <td className="py-4 pl-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500 group-hover:bg-brand group-hover:text-white transition-colors">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">{item.itemName}</span>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">
                    {item.quantity}
                  </span>
                </td>
                <td className="py-4 text-right pr-2">
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(item.revenue)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-center border-t border-gray-50 pt-4">
        <button className="text-xs font-bold text-brand hover:underline">
          View All Performance
        </button>
      </div>
    </div>
  )
}
