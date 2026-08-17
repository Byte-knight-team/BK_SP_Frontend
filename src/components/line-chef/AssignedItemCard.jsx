import { Play, CheckCircle2, UtensilsCrossed, ClipboardList } from 'lucide-react'

const statusConfig = {
  PENDING: { label: 'To Cook', style: 'bg-orange-50 text-orange-500 border border-orange-100' },
  PREPARING: { label: 'Cooking', style: 'bg-blue-50 text-blue-500 border border-blue-100' },
  READY: { label: 'Done', style: 'bg-green-50 text-green-500 border border-green-100' },
  SERVED: { label: 'Done', style: 'bg-green-50 text-green-500 border border-green-100' },
}

const AssignedItemCard = ({ item, onStart, onComplete, isLoading, queueNumber }) => {
  const statusConf = statusConfig[item.status] || { label: item.status, style: 'bg-gray-50 text-gray-500' }

  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      {/* cook-order badge: 1 = oldest/next up */}
      {queueNumber != null && (
        <span className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-xs font-black text-white shadow-md">
          {queueNumber}
        </span>
      )}

      {/* top row: item name + status badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-gray-800 leading-tight">{item.itemName}</h3>
        <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black tracking-tight uppercase ${statusConf.style}`}>
          {statusConf.label}
        </span>
      </div>

      {/* quantity + order number */}
      <p className="mt-1 text-xs font-bold text-gray-400">
        Qty: <span className="text-gray-700">{item.quantity}</span>
      </p>
      <p className="mt-0.5 text-xs font-bold text-gray-400">
        Order: <span className="text-gray-600">#{item.orderNumber}</span>
      </p>

      {/* kitchen notes */}
      {item.itemKitchenNotes && (
        <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-orange-500">
          <UtensilsCrossed size={10} /> Item note: {item.itemKitchenNotes}
        </p>
      )}
      {item.orderKitchenNotes && (
        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-orange-400">
          <ClipboardList size={10} /> Order note: {item.orderKitchenNotes}
        </p>
      )}

      {/* action button */}
      <div className="mt-4">
        {item.status === 'PENDING' && (
          <button
            onClick={() => onStart(item.itemId)}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-100 transition-all hover:bg-orange-600 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <Play size={14} /> Start Cooking
          </button>
        )}
        {item.status === 'PREPARING' && (
          <button
            onClick={() => onComplete(item.itemId)}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 py-2.5 text-sm font-bold text-white shadow-md shadow-green-100 transition-all hover:bg-green-600 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={14} /> Mark Ready
          </button>
        )}
        {item.status === 'READY' && (
          <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-50 py-2.5 text-sm font-bold text-green-500">
            <CheckCircle2 size={14} /> Completed
          </div>
        )}
        {item.status === 'SERVED' && (
          <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-50 py-2.5 text-sm font-bold text-green-500">
            <CheckCircle2 size={14} /> Completed
          </div>
        )}
      </div>
    </div>
  )
}

export default AssignedItemCard
