import { useState, useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useInventoryData } from '../../hooks/useInventoryData'
import { InventoryService } from '../../apis/manager/InventoryService'
import InventoryHeader from '../../components/manager/inventory/InventoryHeader'
import InventorySummaryCards from '../../components/manager/inventory/InventorySummaryCards'
import CurrentStockTable from '../../components/manager/inventory/CurrentStockTable'
import InventoryUpdateLogTable from '../../components/manager/inventory/InventoryUpdateLogTable'
import ChefRequestsSection from '../../components/manager/inventory/ChefRequestsSection'
import AddInventoryItemModal from '../../components/manager/inventory/AddInventoryItemModal'
import UpdateInventoryItemModal from '../../components/manager/inventory/UpdateInventoryItemModal'
import LowStockAlertsTable from '../../components/manager/inventory/LowStockAlertsTable'

function LoadingSpinner() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="text-brand h-10 w-10 animate-spin" />
      <p className="animate-pulse font-medium text-gray-500">
        Loading inventory records...
      </p>
    </div>
  )
}

export default function ManagerInventoryPage() {
  const { data, loading, error, refetch, resolveChefRequest } =
    useInventoryData()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [updateModal, setUpdateModal] = useState({ open: false, item: null })
  const [activeTab, setActiveTab] = useState('current-stock') // 'current-stock', 'update-log', 'chef-requests'
  const chefRequestsRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

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
      <div className="flex min-h-100 flex-col items-center justify-center space-y-4">
        <div className="font-medium text-red-500">
          Failed to load inventory: {error || 'Unknown error'}
        </div>
        <button onClick={refetch} className="btn-primary">
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
    <div className="mx-auto max-w-7xl space-y-6">
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
            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'current-stock'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Current Stock
          </button>
          <button
            onClick={() => setActiveTab('update-log')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'update-log'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Inventory Update Log
          </button>
          <button
            onClick={() => setActiveTab('low-stock')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'low-stock'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Low Stock Alerts
          </button>
          <button
            onClick={() => setActiveTab('chef-requests')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'chef-requests'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
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

      {activeTab === 'low-stock' && (
        <LowStockAlertsTable
          items={data.stockItems.filter((item) => item.status === 'warning')}
          onCreatePo={(item) => {
            navigate('/manager/procurement', {
              state: { openCreatePo: true, autoFillPoItem: item },
            })
          }}
        />
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
