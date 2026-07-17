// React hooks for managing state, side effects, and direct DOM references
import { useState, useEffect, useRef } from 'react'
import { Loader2, Package, Users, History } from 'lucide-react'

// React Router hook to access the current URL and router state
import { useLocation } from 'react-router-dom'

// Custom hook that abstracts the API fetching logic for driver data
import { useDriversData } from '../../hooks/useDriversData'

// API Service to handle post/put requests like assigning a driver
import { ManagerDriverService } from '../../apis/manager/ManagerDriverService'

// UI Components that build the layout of the drivers page
import DriversHeader from '../../components/manager/drivers/DriversHeader'
import DriversSummaryCards from '../../components/manager/drivers/DriversSummaryCards'
import DispatchHub from '../../components/manager/drivers/DispatchHub'
import DriverStatusBoard from '../../components/manager/drivers/DriverStatusBoard'
import DeliveryHistoryTable from '../../components/manager/drivers/DeliveryHistoryTable'
import ActiveOrdersTable from '../../components/manager/drivers/ActiveOrdersTable'
import AssignDriverModal from '../../components/manager/drivers/AssignDriverModal'

/**
 * LoadingSpinner Component
 * Displays a spinning loader while the data is being fetched.
 */
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-brand animate-spin" />
      <p className="text-gray-500 font-medium animate-pulse">Loading driver information...</p>
    </div>
  )
}

export default function ManagerDriversPage() {
  // Fetch drivers, dispatch orders, and history using our custom hook
  const { data, loading, error, refetch } = useDriversData()

  const [assignModal, setAssignModal] = useState({
    open: false,
    order: null, // Stores the specific order being assigned
  })

  // State to manage active tab
  const [activeTab, setActiveTab] = useState('dispatch')

  // Reference to the DispatchHub DOM element so we can scroll to it programmatically
  const dispatchHubRef = useRef(null)

  // Hook to inspect the current router location state (used for auto-scrolling)
  const location = useLocation()

  /**
   * Auto-scroll Effect
   * If the user navigated here from the Dashboard by clicking "Assign Drivers",
   * the router state will contain { scrollToDispatch: true }.
   * This effect waits a moment for the page to render, then smoothly scrolls down.
   */
  useEffect(() => {
    if (location.state?.scrollToDispatch) {
      setTimeout(() => {
        setActiveTab('dispatch')
        dispatchHubRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 500) // Small delay ensures the DOM is fully rendered before scrolling

      // Clear the router state so refreshing the page doesn't scroll again
      window.history.replaceState({}, document.title)
    }
  }, [location])
  // 1. Loading State: Display the spinner while waiting for the API
  if (loading) return <LoadingSpinner />

  // 2. Error State: Display an error message and a retry button if the API fails
  if (error || !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <div className="font-medium text-red-500">
          Failed to load drivers: {error || 'Unknown error'}
        </div>
        <button
          onClick={refetch}
          className="bg-brand hover:bg-brand-hover rounded-full px-6 py-2 font-bold text-white shadow-lg transition-all"
        >
          Try Again
        </button>
      </div>
    )
  }

  /**
   * Opens the assignment modal when the manager clicks "Assign" on a specific order
   */
  const handleAssignDriver = (order) => {
    setAssignModal({ open: true, order })
  }

  /**
   * Executes the API call to assign a driver to an order.
   * Called when the manager confirms their selection inside the modal.
   */
  const handleConfirmAssign = async (orderId, driverId) => {
    try {
      // Call the backend API to create the delivery assignment
      await ManagerDriverService.assignDriver(orderId, driverId)

      // Close the modal on success
      setAssignModal({ open: false, order: null })

      // Refresh the page data so the assigned order moves out of the Dispatch Hub
      refetch()
    } catch (err) {
      console.error('Assignment failed:', err)
      alert(err.message || 'Failed to assign driver. Please try again.')
    }
  }

  // Pre-filter the drivers array to only include those currently 'Available' for the modal dropdown
  const availableDrivers = (data.drivers || []).filter(
    (d) => d.status === 'Available',
  )

  // 3. Success State: Render the main dashboard layout
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page Header (Title and Breadcrumbs) */}
      <DriversHeader />

      {/* Top Row: Quick stat cards showing online vs busy drivers */}
      <DriversSummaryCards
        pendingDispatch={data.pendingDispatch}
        available={data.available}
        activeDeliveries={data.activeDeliveries}
        deliveryAlerts={0} // Hardcoded until backend alerts module is ready
      />

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'dispatch'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dispatch Hub
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'status'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Driver Status Board
          </button>
          <button
            onClick={() => setActiveTab('active_orders')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'active_orders'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Orders
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'history'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Delivery History Log
          </button>
        </nav>
      </div>

      {activeTab === 'dispatch' && (
        <div ref={dispatchHubRef}>
          <DispatchHub
            orders={data.dispatchOrders}
            onAssignDriver={handleAssignDriver}
          />
        </div>
      )}

      {activeTab === 'status' && (
        <DriverStatusBoard drivers={data.drivers} />
      )}

      {activeTab === 'active_orders' && (
        <ActiveOrdersTable drivers={data.drivers || []} />
      )}

      {activeTab === 'history' && (
        <DeliveryHistoryTable history={data.deliveryHistory || []} />
      )}

      {/* 
        Assign Driver Modal Component
        It's hidden by default (isOpen={false}) and only appears when handleAssignDriver is called.
      */}
      <AssignDriverModal
        isOpen={assignModal.open}
        onClose={() => setAssignModal({ open: false, order: null })}
        order={assignModal.order}
        availableDrivers={availableDrivers}
        onConfirm={handleConfirmAssign}
      />
    </div>
  )
}
