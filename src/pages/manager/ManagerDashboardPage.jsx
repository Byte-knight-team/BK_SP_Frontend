// Import the custom hook responsible for fetching all dashboard metrics from the backend
import { useDashboardData } from '../../hooks/useDashboardData'

// Import UI components that make up the different sections of the dashboard
import StatsGrid from '../../components/manager/dashboard/StatsGrid'
import SalesTargetCard from '../../components/manager/dashboard/SalesTargetCard'
import OrderDistributionCard from '../../components/manager/dashboard/OrderDistributionCard'
import RecentOrdersTable from '../../components/manager/dashboard/RecentOrdersTable'
import StaffAvailability from '../../components/manager/dashboard/StaffAvailability'

// Import icons from the lucide-react library used in the header buttons
import { Plus, UserCheck, Loader2 } from 'lucide-react'

// Import routing hook for navigation and authentication hook for user context
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * DashHeader Component
 * Renders the top section of the dashboard with a personalized greeting,
 * current date, and quick action buttons for common manager tasks.
 */
function DashHeader() {
  // Hook to programmatically navigate to other pages
  const navigate = useNavigate()

  // Retrieve the currently logged-in user details from the authentication context
  const { user } = useAuth()

  // Determine the name to display: prioritize full name, fallback to username, then 'Manager'
  const displayName = user?.fullName || user?.username || 'Manager'

  // Format the current date into a human-readable string (e.g., "Monday, May 4, 2026")
  const now = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome! {displayName}
        </h1>
        <p className="mt-1 text-sm text-gray-400">{now}</p>
      </div>
      <div className="flex items-center gap-3">
        {/* Button to navigate to the Inventory page and automatically open the 'Add Item' modal via router state */}
        <button
          onClick={() =>
            navigate('/manager/inventory', { state: { openAddModal: true } })
          }
          className="bg-brand hover:bg-brand-hover flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
        >
          <Plus className="h-5 w-5" /> Add Inventory
        </button>
        {/* Button to navigate to the Drivers page and scroll down to the dispatch section via router state */}
        <button
          onClick={() =>
            navigate('/manager/drivers', { state: { scrollToDispatch: true } })
          }
          className="bg-brand hover:bg-brand-hover flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
        >
          <UserCheck className="h-5 w-5" /> Assign Drivers
        </button>
      </div>
    </div>
  )
}

/**
 * LoadingSpinner Component
 * Provides a visual loading circle while the dashboard data is being fetched.
 * This ensures consistency across all manager pages.
 */
function LoadingSpinner() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="text-brand h-10 w-10 animate-spin" />
      <p className="animate-pulse font-medium text-gray-500">
        Calculating dashboard metrics...
      </p>
    </div>
  )
}

/**
 * ManagerDashboardPage (Main Component)
 * Acts as the container for the entire dashboard. It fetches the required data
 * via a custom hook and distributes it to the specialized child components.
 */
export default function ManagerDashboardPage() {
  // Call the custom hook to fetch all dashboard metrics from the backend API
  // Destructures the data, loading state, error state, and a function to manually refresh
  const { data, loading, error, refetch } = useDashboardData()

  // 1. Loading State: Show the spinner animation if data is still being fetched
  if (loading) return <LoadingSpinner />

  // 2. Error State: Show an error message and a retry button if the API request failed or returned no data
  if (error || !data) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center space-y-4">
        <div className="font-medium text-red-500">
          Failed to load dashboard: {error || 'Unknown error'}
        </div>
        <button onClick={refetch} className="btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  // 3. Success State: Render the actual dashboard using the fetched 'data' object
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Renders the top header with the personalized greeting and action buttons */}
      <DashHeader />

      {/* Renders the top row of high-level statistic cards (Revenue, Orders, etc.) */}
      <StatsGrid data={data} />

      {/* Renders the middle section with two side-by-side charts/cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SalesTargetCard
          current={data.salesTarget.current}
          goal={data.salesTarget.goal}
        />
        <OrderDistributionCard
          total={data.orderDistribution.total}
          dineIn={data.orderDistribution.dineIn}
          online={data.orderDistribution.online}
        />
      </div>

      {/* Renders the table showing the most recent incoming orders */}
      <RecentOrdersTable orders={data.recentOrders} />

      {/* Renders the summary of currently available kitchen and delivery staff */}
      <StaffAvailability
        kitchen={data.staff.kitchen}
        fleet={data.staff.fleet}
        receptionist={data.staff.receptionist}
      />
    </div>
  )
}
