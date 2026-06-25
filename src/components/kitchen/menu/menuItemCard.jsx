import { Clock, Pencil, Tag } from 'lucide-react'

// Status badge color mapping
const STATUS_STYLES = {
  ACTIVE: 'bg-green-50 text-green-600 border border-green-100',
  PENDING: 'bg-orange-50 text-orange-500 border border-orange-100',
  REJECTED: 'bg-red-50 text-red-500 border border-red-100',
  INACTIVE: 'bg-gray-100 text-gray-400 border border-gray-200',
}

const MenuItemCard = ({ item, onEdit }) => {
  const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.INACTIVE

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">

      {/* Item image — shows placeholder if no imageUrl */}
      <div className="relative h-40 bg-gray-100">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300 text-sm">
            No Image
          </div>
        )}

        {/* Status badge — top right corner */}
        <span
          className={`absolute top-2 right-2 rounded-full px-3 py-1 text-[11px] font-black tracking-tighter uppercase ${statusStyle}`}
        >
          {item.status}
        </span>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-4">

        {/* Item name */}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h3>

        {/* Category + sub-category */}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Tag size={12} />
          <span>{item.categoryName}</span>
          {item.subCategory && <span>· {item.subCategory}</span>}
        </div>

        {/* Price + prep time row */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-base font-black text-orange-600">
            Rs. {parseFloat(item.price).toFixed(2)}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={12} />
            <span>{item.preparationTime} min</span>
          </div>
        </div>

        {/* Edit button — only shown for PENDING and REJECTED items */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-50 py-2 text-xs font-bold text-orange-600 hover:bg-orange-100 transition-all"
          >
            <Pencil size={13} />
            Edit Item
          </button>
        )}
      </div>
    </div>
  )
}

export default MenuItemCard
