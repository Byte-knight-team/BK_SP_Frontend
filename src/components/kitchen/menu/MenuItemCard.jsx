import { Clock, Eye, Pencil, Tag } from 'lucide-react'

const STATUS_STYLES = {
  ACTIVE:   'bg-green-50 text-green-600 border border-green-100',
  PENDING:  'bg-orange-50 text-orange-500 border border-orange-100',
  REJECTED: 'bg-red-50 text-red-500 border border-red-100',
  INACTIVE: 'bg-gray-100 text-gray-400 border border-gray-200',
}

const MenuItemCard = ({ item, onEdit, onView }) => {
  const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.INACTIVE

  return (
    <div
      onClick={onView}
      className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-orange-200 transition-all"
    >
      {/* Item image */}
      <div className="relative h-40 bg-gray-100">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300 text-sm">
            No Image
          </div>
        )}

        {/* Status badge */}
        <span className={`absolute top-2 right-2 rounded-full px-3 py-1 text-[11px] font-black tracking-tighter uppercase ${statusStyle}`}>
          {item.status}
        </span>

        {/* Bottom-right icon: pencil for editable, eye for view-only */}
        <div className="absolute bottom-2 right-2 rounded-xl bg-white/90 p-1.5 text-orange-500 shadow">
          {onEdit ? <Pencil size={13} /> : <Eye size={13} />}
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h3>

        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Tag size={12} />
          <span>{item.categoryName}</span>
          {item.subCategory && <span>· {item.subCategory}</span>}
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-base font-black text-orange-600">
            Rs. {parseFloat(item.price).toFixed(2)}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={12} />
            <span>{item.preparationTime} min</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuItemCard
