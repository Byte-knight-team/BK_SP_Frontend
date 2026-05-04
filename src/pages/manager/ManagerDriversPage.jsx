// React hooks for managing state, side effects, and direct DOM references
import { useState, useEffect, useRef } from 'react'

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
import AssignDriverModal from '../../components/manager/drivers/AssignDriverModal'

/**
 * LoadingSkeleton Component
 * Displays a pulsing placeholder layout while the data is being fetched.
 * Enhances user experience by providing immediate visual feedback.
 */
function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-10 w-72 rounded bg-gray-200" />
      <div className="grid grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-gray-200" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="h-64 rounded-2xl bg-gray-200" />
        <div className="h-64 rounded-2xl bg-gray-200" />
      </div>
    </div>
  )
}

export default function ManagerDriversPage() {
  // Fetch drivers, dispatch orders, and history using our custom hook
  const { data, loading, error, refetch } = useDriversData()

  // Local state to manage the visibility and data of the "Assign Driver" modal
  const [assignModal, setAssignModal] = useState({
    open: false,
    order: null, // Stores the specific order being assigned
  })

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
        dispatchHubRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 500) // Small delay ensures the DOM is fully rendered before scrolling

      // Clear the router state so refreshing the page doesn't scroll again
      window.history.replaceState({}, document.title)
    }
  }, [location])
  // 1. Loading State: Display the skeleton UI while waiting for the API
  if (loading) return <LoadingSkeleton />

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
        driversOnline={data.driversOnline}
        available={data.available}
        busy={data.busy}
        pendingDispatch={data.pendingDispatch}
      />

      {/* The Dispatch Hub: Wrapped in a div with a ref so we can scroll to it */}
      <div ref={dispatchHubRef}>
        <DispatchHub
          orders={data.dispatchOrders}
          onAssignDriver={handleAssignDriver}
        />
      </div>

      {/* Table showing real-time status and current tasks of all active drivers */}
      <DriverStatusBoard drivers={data.drivers} />

      {/* Table showing a historical log of completed and cancelled deliveries */}
      <DeliveryHistoryTable history={data.deliveryHistory || []} />

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
