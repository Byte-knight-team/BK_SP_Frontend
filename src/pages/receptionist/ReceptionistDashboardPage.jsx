import { useEffect, useState, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import useWebSocket from '../../hooks/useWebSocket'
import { toast } from 'react-toastify'

import ReceptionistStats from '../../components/receptionist/dashboard/ReceptionistStats'
import RevenueLineChart from '../../components/receptionist/dashboard/RevenueLineChart'
import OrderTypePieChart from '../../components/receptionist/dashboard/OrderTypePieChart'
import TableGridCard from '../../components/receptionist/dashboard/TableGridCard'
import AlertsCard from '../../components/receptionist/dashboard/AlertsCard'
import UpcomingReservationsCard from '../../components/receptionist/dashboard/UpcomingReservationsCard'
import OrderPipelineCard from '../../components/receptionist/dashboard/OrderPipelineCard'

const ReceptionistDashboardPage = () => {
  const { setHeaderInfo } = useOutletContext()
  const { user } = useAuth()
  const [alertsRefreshKey, setAlertsRefreshKey] = useState(0)

  useEffect(() => {
    setHeaderInfo({
      title: 'Dashboard',
      description: 'Live overview of orders, tables, alerts, and revenue.',
      Icon: LayoutDashboard,
    })
  }, [setHeaderInfo])

  const branchId = user?.branchId
  const alertTopic = branchId ? `/topic/branch/${branchId}/alerts` : null

  const handleKitchenAlert = useCallback((alert) => {
    setAlertsRefreshKey(k => k + 1)
    if (alert.type === 'CRITICAL') {
      toast.error(`Kitchen CRITICAL: ${alert.message}`, { autoClose: 8000 })
    } else if (alert.type === 'WARNING') {
      toast.warning(`Kitchen WARNING: ${alert.message}`, { autoClose: 6000 })
    } else {
      toast.info(`Kitchen INFO: ${alert.message}`, { autoClose: 5000 })
    }
  }, [])

  useWebSocket(branchId, alertTopic, handleKitchenAlert)

  return (
    <div className="flex min-h-screen flex-col gap-5 bg-gray-50 p-4">

      {/* TOP — 6 KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <ReceptionistStats />
      </div>

      {/* MIDDLE — pipeline + revenue chart + pie chart */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <OrderPipelineCard />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <RevenueLineChart />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <OrderTypePieChart />
        </div>
      </div>

      {/* BOTTOM — alerts + table grid + reservations */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <AlertsCard refreshKey={alertsRefreshKey} />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <TableGridCard />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <UpcomingReservationsCard />
        </div>
      </div>

    </div>
  )
}

export default ReceptionistDashboardPage
