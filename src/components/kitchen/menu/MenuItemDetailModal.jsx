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
      <div className="w-full max-w-md rounded-4xl border border-gray-100 bg-white shadow-2xl p-8">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
            <UtensilsCrossed size={22} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Title + status */}
        <div className="mb-1 flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{item.name}</h2>
          <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black tracking-tighter uppercase ${statusStyle}`}>
            {item.status}
          </span>
        </div>

        {/* Category */}
        <div className="mb-6 flex items-center gap-1 text-xs text-gray-400">
          <Tag size={11} />
          <span>{item.categoryName}</span>
          {item.subCategory && <span>· {item.subCategory}</span>}
        </div>

        {/* Scrollable content */}
        <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-1">

          {/* Image */}
          <div className="h-40 w-full rounded-2xl overflow-hidden bg-gray-100">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300 text-sm">
                No Image
              </div>
            )}
          </div>

          {/* Price + prep time */}
          <div className="flex gap-3">
            <div className="flex-1 rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400 mb-1">Price</p>
              <p className="text-lg font-black text-orange-600">Rs. {parseFloat(item.price).toFixed(2)}</p>
            </div>
            <div className="flex-1 rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400 mb-1">Prep Time</p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                <Clock size={14} className="text-orange-500" />
                <span>{item.preparationTime} min</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400 mb-1.5">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* Ingredients */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-xl bg-orange-100 p-1.5 text-orange-600">
                <FlaskConical size={13} />
              </div>
              <p className="text-sm font-bold text-gray-800">Recipe Ingredients</p>
              {ingredients.length > 0 && (
                <span className="ml-auto rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-500">
                  {ingredients.length} items
                </span>
              )}
            </div>

            {ingredients.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-4 text-center text-sm text-gray-400">
                No ingredients linked to this item yet.
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-400">
                      <th className="px-4 py-3 text-left font-semibold">Ingredient</th>
                      <th className="px-4 py-3 text-right font-semibold">Qty</th>
                      <th className="px-4 py-3 text-right font-semibold">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {ingredients.map((ing, i) => (
                      <tr key={i} className="hover:bg-gray-50/60">
                        <td className="px-4 py-3 font-medium text-gray-800">{ing.inventoryItemName}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-700">{ing.quantityRequired}</td>
                        <td className="px-4 py-3 text-right text-gray-400">{ing.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-gray-100 py-3 text-sm font-bold text-gray-500 hover:bg-gray-200 transition-colors"
        >
          Close
        </button>

      </div>
    </div>
  )
}

export default MenuItemDetailModal
