import { useState, useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useInventoryData } from '../../hooks/useInventoryData'
import { InventoryService } from '../../apis/manager/InventoryService'
import InventoryHeader from '../../components/manager/inventory/InventoryHeader'
import InventorySummaryCards from '../../components/manager/inventory/InventorySummaryCards'
import CurrentStockTable from '../../components/manager/inventory/CurrentStockTable'
import InventoryUpdateLogTable from '../../components/manager/inventory/InventoryUpdateLogTable'
import ChefRequestsSection from '../../components/manager/inventory/ChefRequestsSection'
import AddInventoryItemModal from '../../components/manager/inventory/AddInventoryItemModal'
import UpdateInventoryItemModal from '../../components/manager/inventory/UpdateInventoryItemModal'

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-brand animate-spin" />
      <p className="text-gray-500 font-medium animate-pulse">Loading inventory records...</p>
    </div>
  )
}

export default function ManagerInventoryPage() {
  const { data, loading, error, refetch, resolveChefRequest } = useInventoryData()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [updateModal, setUpdateModal] = useState({ open: false, item: null })
  const [activeTab, setActiveTab] = useState('current-stock') // 'current-stock', 'update-log', 'chef-requests'
  const chefRequestsRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    if (location.state?.openAddModal) {
      setIsAddModalOpen(true)
      // Clear state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const scrollToChefRequests = () => {
    setActiveTab('chef-requests')
  }

  if (loading) return <LoadingSpinner />

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
        onPendingDraftsClick={scrollToChefRequests}
      />
      
      {/* TABS */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('current-stock')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'current-stock'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Current Stock
          </button>
          <button
            onClick={() => setActiveTab('update-log')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'update-log'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Inventory Update Log
          </button>
          <button
            onClick={() => setActiveTab('chef-requests')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'chef-requests'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Chef Requests
          </button>
        </nav>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'current-stock' && (
        <CurrentStockTable
          items={data.stockItems}
          onUpdateItem={(item) => setUpdateModal({ open: true, item })}
        />
      )}
      
      {activeTab === 'update-log' && (
        <InventoryUpdateLogTable logs={data.logs} />
      )}
      
      {activeTab === 'chef-requests' && (
        <ChefRequestsSection 
          requests={data.chefRequests} 
          scrollRef={chefRequestsRef} 
          resolveChefRequest={resolveChefRequest}
        />
      )}

      {/* Add Item Modal */}
      <AddInventoryItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={async (itemData) => {
          const success = await handleSaveItem(itemData)
          if (success) {
            refetch()
          }
          return success
        }}
        initialData={location.state?.autoFillData}
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
