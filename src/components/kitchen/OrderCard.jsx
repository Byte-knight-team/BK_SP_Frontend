import { UtensilsCrossed } from 'lucide-react'

// Badge color and left border color grouped together per status so both stay in sync
const STATUS_STYLES = {
  PENDING:   { badge: 'bg-orange-50 text-orange-500', border: 'border-l-orange-400' },
  PREPARING: { badge: 'bg-blue-50 text-blue-500',     border: 'border-l-blue-400'   },
  COMPLETED: { badge: 'bg-green-50 text-green-600',   border: 'border-l-green-400'  },
  ON_HOLD:   { badge: 'bg-red-50 text-red-500',       border: 'border-l-red-400'    },
}

// Human-readable label describing what the timestamp means for each status
const TIME_LABELS = {
  PENDING:   'Received',
  PREPARING: 'Started',
  COMPLETED: 'Completed',
  ON_HOLD:   'Held',
}

const OrderCard = ({ status, time, id, numberOfItems, onClick, isClickable = true, isSelected }) => {
  // Fall back to a neutral style if an unexpected status arrives
  const styles = STATUS_STYLES[status] || { badge: 'bg-gray-50 text-gray-400', border: 'border-l-gray-300' }

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      // border-l-4 gives the colored left accent; the right/top/bottom use a thin gray border
      // Selected card gets an orange focus ring instead of the gray border
      className={`rounded-2xl border-l-4 bg-white p-4 shadow-sm transition-all ${styles.border} ${
        isSelected
          ? 'ring-2 ring-orange-400 ring-offset-1 shadow-md'
          : 'border border-gray-100 hover:shadow-md'
      } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* Top row: order number on the left, status badge on the right */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-gray-900">{id}</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-tight ${styles.badge}`}>
          {/* Replace underscore in ON_HOLD so it renders as "ON HOLD" */}
          {status.replace('_', ' ')}
        </span>
      </div>

      {/* Bottom row: contextual time label on the left, item count on the right */}
      <div className="mt-2.5 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {TIME_LABELS[status]} · {time}
        </p>
        {/* Pluralise "item" correctly based on the count */}
        <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
          <UtensilsCrossed size={11} />
          {numberOfItems} {numberOfItems === 1 ? 'item' : 'items'}
        </div>
      </div>
    </div>
  )
}

export default OrderCard
