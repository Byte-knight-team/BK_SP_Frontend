import { useInventoryData } from '../hooks/useInventoryData'
import InventoryHeader from '../components/inventory/InventoryHeader'
import InventorySummaryCards from '../components/inventory/InventorySummaryCards'
import CurrentStockTable from '../components/inventory/CurrentStockTable'
import ChefRequestsSection from '../components/inventory/ChefRequestsSection'

function LoadingSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-72" />
      <div className="grid grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
    </div>
  )
}

export default function InventoryPage() {
  const { data, loading } = useInventoryData()

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <InventoryHeader branch={data.branch} />
      <InventorySummaryCards
        totalValue={data.totalInventoryValue}
        pendingDrafts={data.pendingChefDrafts}
        lowStockAlerts={data.lowStockAlerts}
      />
      <CurrentStockTable items={data.stockItems} />
      <ChefRequestsSection requests={data.chefRequests} />
    </div>
  )
}
