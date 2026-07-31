import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useProcurementData } from '../../hooks/useProcurementData'
import ProcurementHeader from '../../components/manager/procurement/ProcurementHeader'
import ProcurementSummaryCards from '../../components/manager/procurement/ProcurementSummaryCards'
import VendorManagementTab from '../../components/manager/procurement/VendorManagementTab'
import PurchaseOrderTab from '../../components/manager/procurement/PurchaseOrderTab'
import PurchaseOrderLogTable from '../../components/manager/procurement/PurchaseOrderLogTable'
import GoodsReceiptNoteTab from '../../components/manager/procurement/GoodsReceiptNoteTab'
import PendingPOsTab from '../../components/manager/procurement/PendingPOsTab'
import VendorModal from '../../components/manager/procurement/VendorModal'
import CreatePoModal from '../../components/manager/procurement/CreatePoModal'
import CreateGrnModal from '../../components/manager/procurement/CreateGrnModal'

function LoadingSpinner() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="text-brand h-10 w-10 animate-spin" />
      <p className="animate-pulse font-medium text-gray-500">
        Loading procurement data...
      </p>
    </div>
  )
}

export default function ManagerProcurementPage() {
  const { data, loading, error, refetch } = useProcurementData()
  const [activeTab, setActiveTab] = useState('vendors') // 'vendors', 'pos', 'grns'
  const location = useLocation()

  // Modals state
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false)
  const [isPoModalOpen, setIsPoModalOpen] = useState(false)
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false)

  // State for PO creation from Chef Request
  const [selectedChefRequest, setSelectedChefRequest] = useState(null)

  // State for PO creation from Low Stock Alert
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null)

  useEffect(() => {
    if (location.state?.openCreatePo) {
      if (location.state?.autoFillPoItem) {
        setSelectedInventoryItem(location.state.autoFillPoItem)
      }
      setIsPoModalOpen(true)
      // Clear state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const handleCreatePoFromRequest = (request) => {
    setSelectedChefRequest(request)
    setIsPoModalOpen(true)
  }

  const handleClosePoModal = () => {
    setSelectedChefRequest(null)
    setSelectedInventoryItem(null)
    setIsPoModalOpen(false)
  }

  if (loading && !data) return <LoadingSpinner />

  if (error || !data) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center space-y-4">
        <div className="font-medium text-red-500">
          Failed to load procurement: {error || 'Unknown error'}
        </div>
        <button onClick={refetch} className="btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ProcurementHeader
        onNewVendor={() => setIsVendorModalOpen(true)}
        onNewPo={() => setIsPoModalOpen(true)}
        onNewGrn={() => setIsGrnModalOpen(true)}
      />

      <ProcurementSummaryCards
        totalVendors={data?.summary?.totalActiveVendors || 0}
        pendingPos={data?.summary?.activePendingPos || 0}
        monthlySpend={data?.summary?.totalMonthlySpend || 0}
        monthlyGrns={data?.summary?.totalGrnsThisMonth || 0}
      />

      {/* TABS */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'vendors'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Vendors
          </button>
          <button
            onClick={() => setActiveTab('pending-pos')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'pending-pos'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Pending POs
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'pos'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Active Purchase Orders
          </button>
          <button
            onClick={() => setActiveTab('po-log')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'po-log'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Purchase Order Log
          </button>
          <button
            onClick={() => setActiveTab('grns')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'grns'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Goods Receipt Notes
          </button>
        </nav>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'vendors' && (
        <VendorManagementTab
          vendors={data.vendors}
          loading={loading}
          refetch={refetch}
        />
      )}

      {activeTab === 'pending-pos' && (
        <PendingPOsTab
          pendingChefRequests={data.pendingChefRequests}
          loading={loading}
          onSelectChefRequest={handleCreatePoFromRequest}
        />
      )}

      {activeTab === 'pos' && (
        <PurchaseOrderTab
          purchaseOrders={data.purchaseOrders}
          loading={loading}
          refetch={refetch}
          mode="active"
        />
      )}

      {activeTab === 'po-log' && (
        <PurchaseOrderLogTable poLogs={data.poLogs} loading={loading} />
      )}

      {activeTab === 'grns' && (
        <GoodsReceiptNoteTab
          grns={data.grns}
          loading={loading}
          refetch={refetch}
        />
      )}

      {/* Creation Modals */}
      <VendorModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        onSuccess={refetch}
      />
      <CreatePoModal
        isOpen={isPoModalOpen}
        onClose={handleClosePoModal}
        vendors={data.vendors}
        onSuccess={refetch}
        selectedChefRequest={selectedChefRequest}
        selectedInventoryItem={selectedInventoryItem}
      />
      <CreateGrnModal
        isOpen={isGrnModalOpen}
        onClose={() => setIsGrnModalOpen(false)}
        purchaseOrders={data.purchaseOrders}
        onSuccess={refetch}
      />
    </div>
  )
}
