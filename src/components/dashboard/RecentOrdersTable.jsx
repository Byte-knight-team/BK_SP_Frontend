import Badge from '../ui/Badge'
import { Link } from 'react-router-dom'

export default function RecentOrdersTable({ orders }) {
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900">Recent Orders</h2>
        <Link
          to="/orders"
          className="text-sm text-brand font-medium hover:underline"
        >
          View All →
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
            <th className="text-left pb-2 font-medium">Order ID</th>
            <th className="text-left pb-2 font-medium">Type</th>
            <th className="text-left pb-2 font-medium">Status</th>
            <th className="text-right pb-2 font-medium">Timer</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 font-medium text-gray-800">#{order.id}</td>
              <td className="py-3 text-gray-500 uppercase text-xs tracking-wide">
                {order.type}
              </td>
              <td className="py-3">
                <Badge status={order.status.toLowerCase()} />
              </td>
              <td className="py-3 text-right text-gray-500 font-mono text-xs">
                {order.timer}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
