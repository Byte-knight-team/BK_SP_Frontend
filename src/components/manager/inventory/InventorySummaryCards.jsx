import { DollarSign, ClipboardList, AlertTriangle } from 'lucide-react'

function SummaryCard({ icon, iconBg, label, value, valueColor, subtitle, onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      className={`card flex items-start justify-between text-left w-full ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-brand/30 transition-all' : ''}`}
      onClick={onClick}
    >
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p
          className={`text-3xl font-extrabold mt-2 ${valueColor || 'text-gray-900'}`}
        >
          {value}
        </p>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-xl ${iconBg}`}>{icon}</div>
    </Tag>
  )
}

export default function InventorySummaryCards({
  totalValue,
  pendingDrafts,
  lowStockAlerts,
  onPendingDraftsClick,
}) {
  const safeTotalValue = totalValue || 0;
  const safePendingDrafts = pendingDrafts || 0;
  const safeLowStockAlerts = lowStockAlerts || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <SummaryCard
        icon={<DollarSign className="w-6 h-6 text-brand" />}
        iconBg="bg-brand-light"
        label="Total Inventory Value"
        value={`$ ${safeTotalValue.toLocaleString()}`}
        subtitle="Total value of Current Stock"
      />
      <SummaryCard
        icon={<ClipboardList className="w-6 h-6 text-blue-600" />}
        iconBg="bg-blue-50"
        label="Pending Chef Drafts"
        value={`${safePendingDrafts} Drafts`}
        subtitle="Awaiting Manager Approval"
        onClick={onPendingDraftsClick}
      />
      <SummaryCard
        icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
        iconBg="bg-red-50"
        label="Low Stock Alerts"
        value={`${safeLowStockAlerts} Items`}
        valueColor="text-red-500"
        subtitle="Critical Replenishment Needed"
      />
    </div>
  )
}
