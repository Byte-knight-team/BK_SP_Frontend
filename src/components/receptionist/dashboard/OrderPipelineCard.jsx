import { useEffect, useState } from 'react'
import { ListOrdered, ShoppingBag, ChefHat, CheckCheck } from 'lucide-react'
import { getReceptionistOrdersAPI } from '../../../apis/receptionist/orders'

const TYPE_BADGE = {
  QR: 'bg-orange-50 text-orange-600 border border-orange-100',
  ONLINE_PICKUP: 'bg-blue-50 text-blue-600 border border-blue-100',
  ONLINE_DELIVERY: 'bg-purple-50 text-purple-600 border border-purple-100',
}

const TYPE_LABEL = {
  QR: 'QR',
  ONLINE_PICKUP: 'Pickup',
  ONLINE_DELIVERY: 'Delivery',
}

function PipelineColumn({ icon: Icon, label, color, bg, orders }) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className={`flex items-center gap-1.5 rounded-xl ${bg} px-3 py-2`}>
        <Icon size={14} className={color} />
        <span className={`text-xs font-black ${color}`}>{label}</span>
        <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-black ${color} bg-white/60`}>
          {orders.length}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[220px] pr-0.5">
        {orders.length === 0 ? (
          <p className="py-4 text-center text-[10px] font-semibold text-gray-300">Empty</p>
        ) : (
          orders.map(o => (
            <div key={o.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-black text-gray-800">{o.orderNumber || `#${o.id}`}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${TYPE_BADGE[o.orderType] || ''}`}>
                  {TYPE_LABEL[o.orderType] || o.orderType}
                </span>
              </div>
              {o.orderType === 'QR' && o.tableNumber != null && (
                <p className="mt-1 text-xs font-bold text-gray-400">Table #{o.tableNumber}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const OrderPipelineCard = ({ refreshKey = 0 }) => {
  const [newOrders, setNewOrders] = useState([])
  const [kitchenOrders, setKitchenOrders] = useState([])
  const [readyOrders, setReadyOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const [newRes, pendingRes, preparingRes, readyRes] = await Promise.all([
        getReceptionistOrdersAPI('PLACED'),
        getReceptionistOrdersAPI('PENDING'),
        getReceptionistOrdersAPI('PREPARING'),
        getReceptionistOrdersAPI('COMPLETED'),
      ])
      setNewOrders(newRes.data || [])
      setKitchenOrders([...(pendingRes.data || []), ...(preparingRes.data || [])])
      setReadyOrders(readyRes.data || [])
      setLoading(false)
    }
    fetchAll()
  }, [refreshKey])

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex items-center justify-center rounded-xl bg-blue-50 p-2">
          <ListOrdered size={18} className="text-blue-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-800">Order Pipeline</h2>
          <p className="text-xs text-gray-400">Live order flow</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <PipelineColumn
            icon={ShoppingBag}
            label="New"
            color="text-orange-600"
            bg="bg-orange-50"
            orders={newOrders}
          />
          <PipelineColumn
            icon={ChefHat}
            label="Kitchen"
            color="text-blue-600"
            bg="bg-blue-50"
            orders={kitchenOrders}
          />
          <PipelineColumn
            icon={CheckCheck}
            label="Ready"
            color="text-green-600"
            bg="bg-green-50"
            orders={readyOrders}
          />
        </div>
      )}
    </div>
  )
}

export default OrderPipelineCard
