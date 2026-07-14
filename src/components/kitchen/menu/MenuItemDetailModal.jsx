import { useState, useEffect } from 'react'
import { X, UtensilsCrossed, Tag, Clock, FlaskConical, AlertTriangle, Send } from 'lucide-react'
import { createEditRequestAPI } from '../../../apis/kitchen/menu'
import { toast } from 'react-toastify'

// Status badge color map
const STATUS_STYLES = {
  ACTIVE:   'bg-green-50 text-green-600 border border-green-100',
  PENDING:  'bg-orange-50 text-orange-500 border border-orange-100',
  REJECTED: 'bg-red-50 text-red-500 border border-red-100',
  INACTIVE: 'bg-gray-100 text-gray-400 border border-gray-200',
}

/*
  MenuItemDetailModal
  -------------------
  The single "view" modal for a menu item, for every status. Everything here
  is READ-ONLY (info + recipe) — there is no in-place field editing. The only
  action available is, for an ACTIVE item, raising a free-text edit request:
  the chef describes what they want changed (price, prep time, ingredients,
  anything) in one note, and the admin applies it manually after reviewing.
  A chef can send more than one request (e.g. separate asks sent at different
  times) — every PENDING one for this item is listed, and the form stays
  available so another can always be sent.

  Props:
    isOpen             — controls visibility
    onClose            — called when modal is closed
    item               — the menu item object to display
    ingredients        — ingredient list fetched from backend (read-only here)
    pendingEditRequests— all of this item's PENDING edit requests
    onRequestSubmitted — called after a new edit request is successfully sent,
                          so the parent can silently refresh the list above
*/
const MenuItemDetailModal = ({ isOpen, onClose, item, ingredients = [], pendingEditRequests = [], onRequestSubmitted }) => {
  const [chefNote, setChefNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) setChefNote('')
  }, [isOpen, item])

  if (!isOpen || !item) return null

  // "Effectively inactive": an ACTIVE item that's either marked out of stock,
  // sitting in a disabled category, or both — status itself stays ACTIVE.
  const categoryDisabled = item.categoryStatus && item.categoryStatus !== 'ACTIVE'
  const outOfStock = item.isAvailable === false
  const isEffectivelyInactive = item.status === 'ACTIVE' && (categoryDisabled || outOfStock)
  const displayStatus = isEffectivelyInactive ? 'INACTIVE' : item.status
  const statusStyle = STATUS_STYLES[displayStatus] || STATUS_STYLES.INACTIVE

  const inactiveReason =
    categoryDisabled && outOfStock
      ? 'This item and its category are both no longer active.'
      : categoryDisabled
      ? `Category "${item.categoryName}" is no longer active.`
      : outOfStock
      ? 'This item is marked out of stock.'
      : null

  // A category being disabled is the SUPER ADMIN's call, not the branch
  // admin's — there's nothing an edit request could change about that, so no
  // request can be raised while it's disabled. Being out of stock (item-level,
  // set by the branch admin) is a normal editable case — a request can ask
  // for it to be turned back on.
  const canRequestEdit = item.status === 'ACTIVE' && !categoryDisabled

  const handleSubmitRequest = async () => {
    if (!chefNote.trim()) {
      toast.warning('Please describe what you want changed.')
      return
    }
    setSubmitting(true)
    const { error } = await createEditRequestAPI(item.id, chefNote.trim())
    setSubmitting(false)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Edit request sent to admin!')
    setChefNote('')
    onRequestSubmitted?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-4xl border border-gray-100 bg-white shadow-2xl p-8">

        {/* ── Header row ─────────────────────────────────────────────── */}
        <div className="mb-6 flex items-start justify-between">
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
            <UtensilsCrossed size={22} />
          </div>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* ── Title + status badge ────────────────────────────────────── */}
        <div className="mb-1 flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{item.name}</h2>
          <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black tracking-tighter uppercase ${statusStyle}`}>
            {displayStatus}
          </span>
        </div>

        {/* ── Category ───────────────────────────────────────────────── */}
        <div className="mb-4 flex items-center gap-1 text-xs text-gray-400">
          <Tag size={11} />
          <span>{item.categoryName}</span>
          {item.subCategory && <span>· {item.subCategory}</span>}
        </div>

        {/* ── Scrollable section: reason banners + item info + ingredients ── */}
        <div className="space-y-4 max-h-[45vh] overflow-y-auto px-2 -mx-2 mb-4">

          {/* Why this item isn't actually live right now */}
          {isEffectivelyInactive && inactiveReason && (
            <div className="flex items-start gap-2 rounded-2xl bg-gray-50 border border-gray-200 p-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-gray-400" />
              <p className="text-xs font-semibold text-gray-500">{inactiveReason}</p>
            </div>
          )}

          {/* Why this item was rejected */}
          {item.status === 'REJECTED' && item.rejectionReason && (
            <div className="flex items-start gap-2 rounded-2xl bg-red-50 border border-red-100 p-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-400" />
              <p className="text-xs font-semibold text-red-600">{item.rejectionReason}</p>
            </div>
          )}

          {/* Item image */}
          <div className="h-36 w-full rounded-2xl overflow-hidden bg-gray-100">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300 text-sm">
                No Image
              </div>
            )}
          </div>

          {/* Price + prep time — read-only */}
          <div className="flex gap-3">
            <div className="flex-1 rounded-2xl bg-gray-50 p-3">
              <p className="text-xs text-gray-400 mb-1">Price</p>
              <p className="text-base font-black text-orange-600">Rs. {parseFloat(item.price).toFixed(2)}</p>
            </div>
            <div className="flex-1 rounded-2xl bg-gray-50 p-3">
              <p className="text-xs text-gray-400 mb-1">Prep Time</p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                <Clock size={14} className="text-orange-500" />
                <span>{item.preparationTime} min</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="rounded-2xl bg-gray-50 p-3">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* ── Recipe Ingredients — read only, no add/edit/delete here.   */}
          {/* Any change (including to the recipe) goes through the note   */}
          {/* below, same as every other field.                            */}
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-orange-100 p-1.5 text-orange-600">
              <FlaskConical size={13} />
            </div>
            <p className="text-sm font-bold text-gray-800">Recipe Ingredients</p>
            {ingredients.length > 0 && (
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-500">
                {ingredients.length} items
              </span>
            )}
          </div>

          {ingredients.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-4 text-center text-sm text-gray-400">
              No ingredients linked yet.
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-400">
                    <th className="px-3 py-2.5 text-left font-semibold">Ingredient</th>
                    <th className="px-3 py-2.5 text-center font-semibold">Qty</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ingredients.map((ing) => (
                    <tr key={ing.inventoryItemId}>
                      <td className="px-3 py-2.5 font-medium text-gray-800">{ing.inventoryItemName}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-gray-700">{ing.quantityRequired}</td>
                      <td className="px-3 py-2.5 text-right text-gray-400">{ing.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Edit request — only for a live (ACTIVE) item, and only    */}
          {/* while its category is active (a disabled category is the     */}
          {/* Super Admin's call, not something an edit request can fix)   */}
          {item.status === 'ACTIVE' && (
            <div className="pt-1">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-xl bg-orange-100 p-1.5 text-orange-600">
                  <Send size={13} />
                </div>
                <p className="text-sm font-bold text-gray-800">Request an Edit</p>
                {canRequestEdit && pendingEditRequests.length > 0 && (
                  <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-500">
                    {pendingEditRequests.length} pending
                  </span>
                )}
              </div>

              {!canRequestEdit ? (
                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-3">
                  <p className="text-xs font-semibold text-gray-500">
                    Category "{item.categoryName}" was disabled by the Super Admin — that's above the branch
                    admin's control, so no edit request can be raised while it stays disabled.
                  </p>
                </div>
              ) : (
                <>
                  {/* Every PENDING request for this item — a chef can send more than one */}
                  {pendingEditRequests.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {pendingEditRequests.map((r) => (
                        <div key={r.id} className="rounded-2xl bg-orange-50 border border-orange-100 p-3">
                          <p className="text-[11px] font-black uppercase tracking-tighter text-orange-500 mb-1">
                            Pending admin review
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">{r.chefNote}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Form stays available regardless — you can always send another */}
                  <p className="text-xs text-gray-400 mb-2">
                    Describe everything you want changed — price, prep time, ingredients, availability, anything.
                    e.g. "Please reactivate — Rs. 1200, remove Garlic, add Chili Flakes 0.05kg."
                  </p>
                  <textarea
                    value={chefNote}
                    onChange={(e) => setChefNote(e.target.value)}
                    rows={4}
                    placeholder="Type what you want changed..."
                    className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
                  />
                </>
              )}
            </div>
          )}

        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 cursor-pointer rounded-2xl bg-gray-100 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-200 transition-colors">
            Close
          </button>
          {canRequestEdit && (
            <button onClick={handleSubmitRequest} disabled={submitting}
              className="flex-1 cursor-pointer rounded-2xl bg-orange-500 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 transition-colors">
              {submitting ? 'Submitting...' : 'Send Edit Request'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export default MenuItemDetailModal
