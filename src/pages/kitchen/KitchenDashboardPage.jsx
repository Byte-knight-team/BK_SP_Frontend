import Stats from '../../components/kitchen/Dashboard/Stats'
import MostPopularMeals from '../../components/kitchen/Dashboard/MostPopularMeals'
import PeakHoursChart from '../../components/kitchen/Dashboard/PeakHoursChart'
import InventoryAlerts from '../../components/kitchen/Dashboard/InventoryAlerts'
import PendingOrders from '../../components/kitchen/Dashboard/PendingOrders'
import PreparingOrders from '../../components/kitchen/Dashboard/PreparingOrders'
import ActiveAlertsCard from '../../components/kitchen/Dashboard/ActiveAlertsCard'
import { useOutletContext } from 'react-router-dom'
import { useEffect } from 'react'
import { LayoutDashboard } from 'lucide-react'

const KitchenDashboardPage = () => {
  const { setHeaderInfo } = useOutletContext()

  useEffect(() => {
    setHeaderInfo({
      title: 'Kitchen Dashboard Overview',
      Icon: LayoutDashboard,
    })
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-4">
      {/* KPI GRID */}
      <div className="mt-4 grid grid-cols-4 gap-3">
        <Stats />
      </div>

      {/* MIDDLE CONTENT — chart gets 2x width, side cards stay narrow */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* SECTION: POPULAR MEALS */}
        <div className="h-[420px] rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-1">
          <MostPopularMeals />
        </div>

        {/* SECTION: PEAK HOURS */}
        <div className="h-[420px] rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <PeakHoursChart />
        </div>

        {/* KITCHEN ALERTS CARD */}
        <div className="h-[420px] rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-1">
          <ActiveAlertsCard />
        </div>
      </div>

      {/* BOTTOM CONTENT */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* SECTION: PENDING ORDERS */}
        <div className="h-[420px] rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <PendingOrders />
        </div>

        {/* SECTION: PREPARING ORDERS */}
        <div className="h-[420px] rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <PreparingOrders />
        </div>

        {/* SECTION: INVENTORY ALERTS */}
        <div className="h-[420px] rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <InventoryAlerts />
        </div>

      </div>
    </div>
  )
}

export default KitchenDashboardPage
