import { DollarSign, ClipboardList, AlertTriangle } from 'lucide-react'

function SummaryCard({
  icon,
  iconBg,
  label,
  value,
  valueColor,
  subtitle,
  onClick,
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      className={`card flex w-full items-start justify-between text-left ${onClick ? 'hover:ring-brand/30 cursor-pointer transition-all hover:ring-2' : ''}`}
      onClick={onClick}
    >
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p
          className={`mt-2 text-3xl font-extrabold ${valueColor || 'text-gray-900'}`}
        >
          {value}
        </p>
        <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
      </div>
      <div className={`rounded-xl p-3 ${iconBg}`}>{icon}</div>
    </Tag>
  )
}

export default function InventorySummaryCards({
  totalValue,
  pendingDrafts,
  lowStockAlerts,
  onPendingDraftsClick,
}) {
  const safeTotalValue = totalValue || 0
  const safePendingDrafts = pendingDrafts || 0
  const safeLowStockAlerts = lowStockAlerts || 0

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <SummaryCard
        icon={<DollarSign className="text-brand h-6 w-6" />}
        iconBg="bg-brand-light"
        label="Total Inventory Value"
        value={`Rs. ${safeTotalValue.toLocaleString()}`}
        subtitle="Total value of Current Stock"
      />
      <SummaryCard
        icon={<ClipboardList className="h-6 w-6 text-blue-600" />}
        iconBg="bg-blue-50"
        label="Pending Chef Drafts"
        value={`${safePendingDrafts} Drafts`}
        subtitle="Awaiting Manager Approval"
        onClick={onPendingDraftsClick}
      />
      <SummaryCard
        icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
        iconBg="bg-red-50"
        label="Low Stock Alerts"
        value={`${safeLowStockAlerts} Items`}
        valueColor="text-red-500"
        subtitle="Critical Replenishment Needed"
      />
    </div>
  )
}
