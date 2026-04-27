import { useState } from 'react'
import { useInventoryData } from '../../hooks/useInventoryData'
import { InventoryService } from '../../apis/manager/InventoryService'
import InventoryHeader from '../../components/manager/inventory/InventoryHeader'
import InventorySummaryCards from '../../components/manager/inventory/InventorySummaryCards'
import CurrentStockTable from '../../components/manager/inventory/CurrentStockTable'
import InventoryUpdateLogTable from '../../components/manager/inventory/InventoryUpdateLogTable'
import ChefRequestsSection from '../../components/manager/inventory/ChefRequestsSection'
import AddInventoryItemModal from '../../components/manager/inventory/AddInventoryItemModal'
import UpdateInventoryItemModal from '../../components/manager/inventory/UpdateInventoryItemModal'

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
  const { data, loading, error, refetch } = useInventoryData()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [updateModal, setUpdateModal] = useState({ open: false, item: null })

  if (loading) return <LoadingSkeleton />

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500 font-medium">Failed to load inventory: {error || 'Unknown error'}</div>
        <button 
          onClick={refetch}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  const handleSaveItem = async (itemData) => {
    try {
      await InventoryService.addItem(itemData)
      return true
    } catch (error) {
      console.error('Failed to save item:', error)
      return false
    }
  }

  /**
   * Handles all three update operations (restock, remove, correction).
   * Delegates to the appropriate InventoryService method based on updateType.
   */
  const handleUpdateItem = async (updateType, itemId, formData) => {
    try {
      if (updateType === 'restock') {
        await InventoryService.restockItem(itemId, formData)
      } else if (updateType === 'remove') {
        await InventoryService.removeStock(itemId, formData)
      } else if (updateType === 'correction') {
        await InventoryService.correctItem(itemId, formData)
      }
      return true
    } catch (err) {
      console.error(`Failed to ${updateType} item:`, err)
      return false
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <InventoryHeader
        branch={data.summary.branch}
        onAddItem={() => setIsAddModalOpen(true)}
      />
      <InventorySummaryCards
        totalValue={data.summary.totalInventoryValue}
        pendingDrafts={data.summary.pendingChefDrafts}
        lowStockAlerts={data.summary.lowStockAlerts}
      />
      <CurrentStockTable
        items={data.stockItems}
        onUpdateItem={(item) => setUpdateModal({ open: true, item })}
      />
      <InventoryUpdateLogTable logs={data.logs} />
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

      {/* Update Item Modal */}
      <UpdateInventoryItemModal
        isOpen={updateModal.open}
        item={updateModal.item}
        onClose={() => {
          setUpdateModal({ open: false, item: null })
          refetch()
        }}
        onUpdate={handleUpdateItem}
      />
    </div>
  )
}
