import { useEffect, useState, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import useWebSocket from '../../hooks/useWebSocket'

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
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0)
  const [tablesRefreshKey, setTablesRefreshKey] = useState(0)
  const [statsRefreshKey, setStatsRefreshKey] = useState(0)
  const [reservationsRefreshKey, setReservationsRefreshKey] = useState(0)

  useEffect(() => {
    setHeaderInfo({
      title: 'Dashboard',
      description: 'Live overview of orders, tables, alerts, and revenue.',
      Icon: LayoutDashboard,
    })
  }, [setHeaderInfo])

  const branchId = user?.branchId

  // Single WebSocket connection — all branch-scoped topics
  const topics = branchId ? [
    `/topic/branch/${branchId}/alerts`,
    `/topic/branch/${branchId}/order-status-update`,
    `/topic/branch/${branchId}/kitchen-orders`,
    `/topic/branch/${branchId}/table-update`,
    `/topic/branch/${branchId}/reservation-update`,
  ] : null

  const handleMessage = useCallback((message, topic) => {
    if (topic.endsWith('/alerts')) {
      // Toast is shown globally by ReceptionistNotifier; here we only refresh the alerts data.
      setAlertsRefreshKey(k => k + 1)
    }

    if (topic.endsWith('/order-status-update') || topic.endsWith('/kitchen-orders')) {
      setOrdersRefreshKey(k => k + 1)
      setStatsRefreshKey(k => k + 1)
    }

    if (topic.endsWith('/table-update')) {
      setTablesRefreshKey(k => k + 1)
    }

    if (topic.endsWith('/reservation-update')) {
      setReservationsRefreshKey(k => k + 1)
    }
  }, [])

  useWebSocket(branchId, topics, handleMessage)

  return (
    <div className="flex min-h-screen flex-col gap-5 bg-gray-50 p-4">

      {/* TOP — 6 KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <ReceptionistStats refreshKey={statsRefreshKey} />
      </div>

      {/* MIDDLE — revenue chart (2/3) + pie chart (1/3) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-[420px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <RevenueLineChart />
        </div>

        <div className="h-[420px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <OrderTypePieChart />
        </div>
      </div>

      {/* PIPELINE — full width */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <OrderPipelineCard refreshKey={ordersRefreshKey} />
      </div>

      {/* BOTTOM — alerts + table grid + reservations (fixed tall so ~5 rows fit) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-[400px] rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <AlertsCard refreshKey={alertsRefreshKey} />
        </div>

        <div className="h-[400px] rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <TableGridCard refreshKey={tablesRefreshKey} />
        </div>

        <div className="h-[400px] rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <UpcomingReservationsCard refreshKey={reservationsRefreshKey} />
        </div>
      </div>

    </div>
  )
}

export default ReceptionistDashboardPage
