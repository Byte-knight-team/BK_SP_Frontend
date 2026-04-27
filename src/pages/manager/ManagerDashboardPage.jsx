import { useDashboardData } from '../../hooks/useDashboardData'
import StatsGrid from '../../components/manager/dashboard/StatsGrid'
import SalesTargetCard from '../../components/manager/dashboard/SalesTargetCard'
import OrderDistributionCard from '../../components/manager/dashboard/OrderDistributionCard'
import RecentOrdersTable from '../../components/manager/dashboard/RecentOrdersTable'
import StaffAvailability from '../../components/manager/dashboard/StaffAvailability'
import FleetTrackerBanner from '../../components/manager/dashboard/FleetTrackerBanner'
import { Plus, UserCheck, Eye } from 'lucide-react'

function DashHeader() {
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
          Good Morning, Manager
        </h1>
        <p className="mt-1 text-sm text-gray-400">{now}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-brand-hover transition-colors">
          <Plus className="h-5 w-5" /> Add Inventory
        </button>
        <button className="flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-brand-hover transition-colors">
          <UserCheck className="h-5 w-5" /> Assign Drivers
        </button>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-64 rounded bg-gray-200" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-gray-200" />
        ))}
      </div>
    </div>
  )
}

export default function ManagerDashboardPage() {
  const { data, loading, error, refetch } = useDashboardData()

  if (loading) return <LoadingSkeleton />

  if (error || !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <div className="font-medium text-red-500">
          Failed to load dashboard: {error || 'Unknown error'}
        </div>
        <button onClick={refetch} className="btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashHeader />
      <StatsGrid data={data} />

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

      <RecentOrdersTable orders={data.recentOrders} />
      <StaffAvailability
        kitchen={data.staff.kitchen}
        fleet={data.staff.fleet}
      />
      <FleetTrackerBanner activeDeliveries={data.fleetActiveDeliveries} />
    </div>
  )
}
