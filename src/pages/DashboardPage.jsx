import { useDashboardData } from '../hooks/useDashboardData'
import StatsGrid from '../components/dashboard/StatsGrid'
import SalesTargetCard from '../components/dashboard/SalesTargetCard'
import OrderDistributionCard from '../components/dashboard/OrderDistributionCard'
import RecentOrdersTable from '../components/dashboard/RecentOrdersTable'
import StaffAvailability from '../components/dashboard/StaffAvailability'
import FleetTrackerBanner from '../components/dashboard/FleetTrackerBanner'
import { Plus, UserCheck, Eye } from 'lucide-react'

function DashHeader() {
  const now = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Good Morning, Manager
        </h1>
        <p className="text-sm text-gray-400 mt-1">{now}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-outline flex items-center gap-2 text-base">
          <Plus className="w-5 h-5" /> Add Inventory
        </button>
        <button className="btn-outline flex items-center gap-2 text-base">
          <UserCheck className="w-5 h-5" /> Assign Driver
        </button>
        <button className="btn-primary flex items-center gap-2 text-base">
          <Eye className="w-5 h-5" /> View Live Orders
        </button>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data, loading } = useDashboardData()

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <DashHeader />
      <StatsGrid data={data} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
