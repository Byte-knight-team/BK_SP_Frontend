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

      {/* MIDDLE CONTENT */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {/* SECTION: POPULAR MEALS */}
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <MostPopularMeals />
        </div>

        {/* SECTION: PEAK HOURS */}
        <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <PeakHoursChart />
        </div>

        {/* KITCHEN ALERTS CARD */}
        <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <ActiveAlertsCard />
        </div>
      </div>

      {/* BOTTOM CONTENT */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* SECTION: PENDING ORDERS */}
        <div className="rounded-2xl border border-gray-50 bg-white p-4 shadow-sm lg:col-span-1">
          <PendingOrders />
        </div>

        {/* SECTION: PREPARING ORDERS */}
        <div className="rounded-2xl border border-gray-50 bg-white p-4 shadow-sm lg:col-span-1">
          <PreparingOrders />
        </div>

        {/* SECTION: INVENTORY ALERTS */}
        <div className="rounded-2xl border border-gray-50 bg-white p-6 shadow-sm lg:col-span-1">
          <InventoryAlerts />
        </div>
        
      </div>
    </div>
  )
}

export default KitchenDashboardPage
