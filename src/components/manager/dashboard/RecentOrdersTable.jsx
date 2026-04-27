import Badge from '../ui/Badge'
import { Link } from 'react-router-dom'

export default function RecentOrdersTable({ orders }) {
  return (
    <div className="card">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        <Link
          to="/orders"
          className="text-brand flex items-center gap-1 text-base font-medium hover:underline"
        >
          View All →
        </Link>
      </div>
      <table className="w-full text-base">
        <thead>
          <tr className="border-b border-gray-100 text-sm tracking-wider text-gray-400 uppercase">
            <th className="pb-3 text-left font-medium">Order ID</th>
            <th className="pb-3 text-left font-medium">Type</th>
            <th className="pb-3 text-left font-medium">Status</th>
            <th className="pb-3 text-center font-medium">Order Amount</th>
            <th className="pb-3 text-right font-medium">Placed On</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {(orders || []).map((order) => (
            <tr key={order.id} className="transition-colors hover:bg-gray-50">
              <td className="py-4 font-medium text-gray-800">{order.id}</td>
              <td className="py-4 text-sm tracking-wide text-gray-500 uppercase">
                {order.type}
              </td>
              <td className="py-4">
                <Badge status={order.status.toLowerCase()} />
              </td>
              <td className="py-4 text-center font-medium text-gray-900">
                Rs.{Number(order.amount).toLocaleString()}
              </td>
              <td className="py-4 text-right text-sm font-medium text-gray-900">
                {order.timer}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
