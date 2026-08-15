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

import DeliveryAlertsTable from '../../components/manager/drivers/DeliveryAlertsTable'

/**
 * LoadingSpinner Component
 * Displays a spinning loader while the data is being fetched.
 */
function LoadingSpinner() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="text-brand h-10 w-10 animate-spin" />
      <p className="animate-pulse font-medium text-gray-500">
        Loading driver information...
      </p>
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
    } else if (location.state?.tab) {
      setActiveTab(location.state.tab)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  // Switch to alerts tab automatically if there are open alerts on initial load
  useEffect(() => {
    if (data?.deliveryAlerts > 0 && activeTab === 'dispatch') {
      setActiveTab('alerts')
    }
  }, [data?.deliveryAlerts])

  // 1. Loading State: Display the spinner while waiting for the API
  if (loading) return <LoadingSpinner />

  // 2. Error State: Display an error message and a retry button if the API fails
  if (error || !data) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center space-y-4">
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
        deliveryAlerts={data.deliveryAlerts || 0}
        onAlertsClick={() => setActiveTab('alerts')}
      />

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'dispatch'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Dispatch Hub
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'alerts'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Delivery Alerts
            {data.deliveryAlerts > 0 && (
              <span className="flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-red-100 text-xs text-red-600">
                {data.deliveryAlerts}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'status'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Driver Status Board
          </button>
          <button
            onClick={() => setActiveTab('active_orders')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'active_orders'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Active Orders
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'history'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
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

      {activeTab === 'alerts' && (
        <DeliveryAlertsTable
          alerts={data.deliveryAlertList || []}
          onAssignDriver={handleAssignDriver}
        />
      )}

      {activeTab === 'status' && <DriverStatusBoard drivers={data.drivers} />}

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
