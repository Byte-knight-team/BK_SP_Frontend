import Modal from '../ui/Modal'
import { PlusCircle, Trash2, Pencil, User, Clock, Package, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

/**
 * Configuration for update type display in the modal header.
 */
const TYPE_CONFIG = {
  RESTOCK: {
    label: 'Restock',
    icon: PlusCircle,
    badgeClass: 'bg-green-50 text-green-600',
    accentColor: 'text-green-600',
    description: 'Stock was added to inventory',
  },
  WASTAGE: {
    label: 'Wastage',
    icon: Trash2,
    badgeClass: 'bg-red-50 text-red-600',
    accentColor: 'text-red-600',
    description: 'Stock was removed due to wastage or damage',
  },
  CORRECTION: {
    label: 'Correction',
    icon: Pencil,
    badgeClass: 'bg-amber-50 text-amber-600',
    accentColor: 'text-amber-600',
    description: 'Stock details were corrected by a manager',
  },
}

/**
 * A single detail row in the modal body.
 */
function DetailRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className={clsx('text-sm font-bold mt-0.5', highlight || 'text-gray-900')}>
          {value || '—'}
        </p>
      </div>
    </div>
  )
}

/**
 * Popup modal for viewing full details of an inventory update log entry.
 * Adapts its display based on the transaction type (RESTOCK / WASTAGE / CORRECTION).
 */
export default function LogDetailModal({ isOpen, onClose, log }) {
  if (!log) return null

  const config = TYPE_CONFIG[log.updateType] || TYPE_CONFIG.RESTOCK
  const TypeIcon = config.icon

  // Format quantity change for display
  const formatQtyChange = () => {
    if (log.quantityChange == null) return '—'
    const val = parseFloat(log.quantityChange)
    const unit = log.unit || ''
    if (val > 0) return `+${val} ${unit}`
    if (val < 0) return `${val} ${unit}`
    return `0 ${unit}`
  }

  // Format stock transition (before → after)
  const formatStockTransition = () => {
    const prev = log.previousQuantity != null ? parseFloat(log.previousQuantity) : '—'
    const next = log.newQuantity != null ? parseFloat(log.newQuantity) : '—'
    const unit = log.unit || ''
    return { prev: `${prev} ${unit}`, next: `${next} ${unit}` }
  }

  const stock = formatStockTransition()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Details"
      subtitle={log.updatedAt}
    >
      <div className="space-y-5">
        {/* Type Badge + Item Header */}
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
          <div className={clsx(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            config.badgeClass
          )}>
            <TypeIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-gray-900">{log.itemName}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className={clsx(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                config.badgeClass
              )}>
                {config.label}
              </span>
              {log.category && (
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                  {log.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stock Transition Visual — shown for RESTOCK and WASTAGE only */}
        {log.updateType !== 'CORRECTION' ? (
          <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Before</p>
              <p className="mt-1 text-lg font-extrabold text-gray-900">{stock.prev}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="h-5 w-5 text-gray-300" />
              <span className={clsx(
                'text-xs font-bold',
                log.updateType === 'RESTOCK' ? 'text-green-600' : 'text-red-600'
              )}>
                {formatQtyChange()}
              </span>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">After</p>
              <p className="mt-1 text-lg font-extrabold text-gray-900">{stock.next}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Update Note
            </p>
            <p className="text-sm text-gray-700 leading-relaxed italic">
              {log.notes ? `"${log.notes}"` : 'No notes provided'}
            </p>
          </div>
        )}

        {/* Detail Rows */}
        <div className="rounded-xl border border-gray-100 px-4">
          {log.unitPrice != null && (
            <DetailRow
              icon={Package}
              label={log.updateType === 'RESTOCK' ? 'Batch Unit Price' : 'Unit Price at Time'}
              value={`Rs. ${parseFloat(log.unitPrice).toFixed(2)} / ${log.unit || 'unit'}`}
            />
          )}

          <DetailRow
            icon={User}
            label="Performed By"
            value={log.performedBy}
          />

          <DetailRow
            icon={Clock}
            label="Timestamp"
            value={log.updatedAt}
          />
        </div>

        {/* Notes Section — hidden for CORRECTION (already shown above) */}
        {log.notes && log.updateType !== 'CORRECTION' && (
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              {log.updateType === 'WASTAGE' ? 'Reason' : 'Notes'}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed italic">
              "{log.notes}"
            </p>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-center pt-1">
          <button
            onClick={onClose}
            className="rounded-full bg-brand px-10 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}
