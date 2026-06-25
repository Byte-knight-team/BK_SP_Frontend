import { X, UtensilsCrossed, Tag, Clock, FlaskConical } from 'lucide-react'

const STATUS_STYLES = {
  ACTIVE:   'bg-green-50 text-green-600 border border-green-100',
  PENDING:  'bg-orange-50 text-orange-500 border border-orange-100',
  REJECTED: 'bg-red-50 text-red-500 border border-red-100',
  INACTIVE: 'bg-gray-100 text-gray-400 border border-gray-200',
}

const MenuItemDetailModal = ({ isOpen, onClose, item, ingredients = [] }) => {
  if (!isOpen || !item) return null

  const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.INACTIVE

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-4xl border border-gray-100 bg-white shadow-2xl overflow-hidden">

        {/* Image banner */}
        <div className="relative h-44 bg-gray-100">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300 text-sm">
              No Image
            </div>
          )}
          {/* Status badge */}
          <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-black tracking-tighter uppercase ${statusStyle}`}>
            {item.status}
          </span>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 rounded-xl bg-white/90 p-1.5 text-gray-500 shadow hover:text-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">

          {/* Name + category */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
              <Tag size={12} />
              <span>{item.categoryName}</span>
              {item.subCategory && <span>· {item.subCategory}</span>}
            </div>
          </div>

          {/* Price + prep time */}
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Price</p>
              <p className="text-lg font-black text-orange-600">Rs. {parseFloat(item.price).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Prep Time</p>
              <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                <Clock size={14} />
                <span>{item.preparationTime} min</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* Ingredients */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical size={15} className="text-orange-500" />
              <p className="text-sm font-bold text-gray-800">Recipe Ingredients</p>
            </div>

            {ingredients.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No ingredients linked to this item yet.</p>
            ) : (
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Ingredient</th>
                      <th className="px-4 py-2.5 text-right">Qty Required</th>
                      <th className="px-4 py-2.5 text-right">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {ingredients.map((ing, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{ing.inventoryItemName}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{ing.quantityRequired}</td>
                        <td className="px-4 py-3 text-right text-gray-400">{ing.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default MenuItemDetailModal
