import { useState } from 'react'
import { useInventoryData } from '../../hooks/useInventoryData'
import { InventoryService } from '../../apis/manager/InventoryService'
import InventoryHeader from '../../components/manager/inventory/InventoryHeader'
import InventorySummaryCards from '../../components/manager/inventory/InventorySummaryCards'
import CurrentStockTable from '../../components/manager/inventory/CurrentStockTable'
import ChefRequestsSection from '../../components/manager/inventory/ChefRequestsSection'
import AddInventoryItemModal from '../../components/manager/inventory/AddInventoryItemModal'

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

export default function ManagerInventoryPage() {
  const { data, loading, refetch } = useInventoryData()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  if (loading) return <LoadingSkeleton />

  const handleSaveItem = async (itemData) => {
    try {
      await InventoryService.addItem(itemData)
      return true
    } catch (error) {
      console.error('Failed to save item:', error)
      return false
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <InventoryHeader
        branch={data.branch}
        onAddItem={() => setIsAddModalOpen(true)}
      />
      <InventorySummaryCards
        totalValue={data.totalInventoryValue}
        pendingDrafts={data.pendingChefDrafts}
        lowStockAlerts={data.lowStockAlerts}
      />
      <CurrentStockTable items={data.stockItems} />
      <ChefRequestsSection requests={data.chefRequests} />

      {/* Add Item Modal */}
      <AddInventoryItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          refetch()
        }}
        onSave={handleSaveItem}
      />
    </div>
  )
}
