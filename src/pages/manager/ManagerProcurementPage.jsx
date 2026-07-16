import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useProcurementData } from '../../hooks/useProcurementData'
import ProcurementHeader from '../../components/manager/procurement/ProcurementHeader'
import ProcurementSummaryCards from '../../components/manager/procurement/ProcurementSummaryCards'
import VendorManagementTab from '../../components/manager/procurement/VendorManagementTab'
import PurchaseOrderTab from '../../components/manager/procurement/PurchaseOrderTab'
import GoodsReceiptNoteTab from '../../components/manager/procurement/GoodsReceiptNoteTab'
import PendingPOsTab from '../../components/manager/procurement/PendingPOsTab'
import VendorModal from '../../components/manager/procurement/VendorModal'
import CreatePoModal from '../../components/manager/procurement/CreatePoModal'
import CreateGrnModal from '../../components/manager/procurement/CreateGrnModal'

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-brand animate-spin" />
      <p className="text-gray-500 font-medium animate-pulse">Loading procurement data...</p>
    </div>
  )
}

export default function ManagerProcurementPage() {
  const { data, loading, error, refetch } = useProcurementData()
  const [activeTab, setActiveTab] = useState('vendors') // 'vendors', 'pos', 'grns'

  // Modals state
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false)
  const [isPoModalOpen, setIsPoModalOpen] = useState(false)
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false)
  
  // State for PO creation from Chef Request
  const [selectedChefRequest, setSelectedChefRequest] = useState(null)

  const handleCreatePoFromRequest = (request) => {
    setSelectedChefRequest(request)
    setIsPoModalOpen(true)
  }

  const handleClosePoModal = () => {
    setSelectedChefRequest(null)
    setIsPoModalOpen(false)
  }

  if (loading && !data) return <LoadingSpinner />

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500 font-medium">Failed to load procurement: {error || 'Unknown error'}</div>
        <button onClick={refetch} className="btn-primary">Try Again</button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'vendors'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Vendors
          </button>
          <button
            onClick={() => setActiveTab('pending-pos')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'pending-pos'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending POs
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'pos'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Purchase Orders
          </button>
          <button
            onClick={() => setActiveTab('grns')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'grns'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Goods Receipt Notes
          </button>
        </nav>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'vendors' && (
        <VendorManagementTab vendors={data.vendors} loading={loading} refetch={refetch} />
      )}
      
      {activeTab === 'pending-pos' && (
        <PendingPOsTab 
          pendingChefRequests={data.pendingChefRequests} 
          loading={loading} 
          onSelectChefRequest={handleCreatePoFromRequest} 
        />
      )}
      
      {activeTab === 'pos' && (
        <PurchaseOrderTab purchaseOrders={data.purchaseOrders} loading={loading} refetch={refetch} />
      )}
      
      {activeTab === 'grns' && (
        <GoodsReceiptNoteTab grns={data.grns} loading={loading} refetch={refetch} />
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
