import { Clock, Eye, Pencil, Tag } from 'lucide-react'

const STATUS_STYLES = {
  ACTIVE:   'bg-green-50 text-green-600 border border-green-100',
  PENDING:  'bg-orange-50 text-orange-500 border border-orange-100',
  REJECTED: 'bg-red-50 text-red-500 border border-red-100',
  INACTIVE: 'bg-gray-100 text-gray-400 border border-gray-200',
}

const MenuItemCard = ({ item, onView }) => {
  // An item is off the live menu for one of two independent reasons: its own
  // status was set to INACTIVE by the branch admin, or its category was
  // disabled by the SUPER ADMIN. Both can be true at once.
  const categoryDisabled = item.categoryStatus && item.categoryStatus !== 'ACTIVE'
  const itemDeactivated = item.status === 'INACTIVE'
  const displayStatus = categoryDisabled || itemDeactivated ? 'INACTIVE' : item.status
  const statusStyle = STATUS_STYLES[displayStatus] || STATUS_STYLES.INACTIVE

  const inactiveReason =
    categoryDisabled && itemDeactivated
      ? 'Item deactivated & category disabled'
      : categoryDisabled
      ? `Category "${item.categoryName}" is disabled`
      : itemDeactivated
      ? 'Deactivated by branch admin'
      : null

  // Category-disabled is the Super Admin's call — no edit request possible
  // while that's the case. The item's own status (ACTIVE or INACTIVE, set by
  // the branch admin) is a normal editable case either way.
  const canRequestEdit = (item.status === 'ACTIVE' || item.status === 'INACTIVE') && !categoryDisabled

  // Kitchen Availability only makes sense for the item's true live state.
  const isLiveOnMenu = item.status === 'ACTIVE' && !categoryDisabled

  // "NEW" — approved today. Helps a just-approved item stand out at the top
  // of the (approvedAt-sorted) Active list.
  const isNew =
    item.approvedAt && new Date(item.approvedAt).toDateString() === new Date().toDateString()

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

        {/* Status badge — shows why an approved item isn't actually live, when relevant */}
        <span
          className={`absolute top-2 right-2 rounded-full px-3 py-1 text-[11px] font-black tracking-tighter uppercase ${statusStyle}`}
          title={inactiveReason || undefined}
        >
          {displayStatus}
        </span>

        {/* NEW — approved today */}
        {isNew && (
          <span className="absolute top-2 left-2 rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black tracking-tighter uppercase text-white shadow">
            New
          </span>
        )}

        {/* Bottom-right icon: pencil = can request an edit, eye = view-only */}
        <div className="absolute bottom-2 right-2 rounded-xl bg-white/90 p-1.5 text-orange-500 shadow">
          {canRequestEdit ? <Pencil size={13} /> : <Eye size={13} />}
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h3>

        {/* Explains why an approved item is shown as inactive */}
        {inactiveReason && (
          <p className="text-[11px] font-bold text-gray-400">{inactiveReason}</p>
        )}

        {/* Kitchen availability — only for the item's true live state
            (ACTIVE + category active); moot if deactivated or category disabled */}
        {isLiveOnMenu && (
          <span
            className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
              item.isAvailable === true
                ? 'bg-green-50 text-green-600'
                : item.isAvailable === false
                ? 'bg-rose-50 text-rose-600'
                : 'bg-amber-50 text-amber-600'
            }`}
          >
            {item.isAvailable === true ? 'Available' : item.isAvailable === false ? 'Unavailable' : 'Availability not set'}
          </span>
        )}

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
