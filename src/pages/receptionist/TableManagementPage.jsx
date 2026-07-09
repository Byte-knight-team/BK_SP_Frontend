import { useState, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'react-toastify'
import { LayoutGrid, CalendarPlus, CalendarDays } from 'lucide-react'
import TableCard from '../../components/receptionist/table management/TableCard'
import TableActionModal from '../../components/receptionist/table management/TableActionModal'
import ReservationModal from '../../components/receptionist/table management/ReservationModal'
import ReservationsListModal from '../../components/receptionist/table management/ReservationsListModal'
import { getBranchTablesAPI } from '../../apis/receptionist/tables'
import { useAuth } from '../../context/AuthContext'
import useWebSocket from '../../hooks/useWebSocket'

const TableManagementPage = () => {
  const { setHeaderInfo } = useOutletContext()
  const { user } = useAuth()
  const [selectedTable, setSelectedTable] = useState(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)
  const [isReservationsListOpen, setIsReservationsListOpen] = useState(false)
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setHeaderInfo({
      title: 'Table Management',
      description: 'Monitor live table status and manage guest seating.',
      Icon: LayoutGrid,
    })
  }, [setHeaderInfo])

  const fetchTables = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    const { data, error } = await getBranchTablesAPI()
    if (error) {
      toast.error('Error: Could not sync with live table status')
    } else if (data) {
      setTables(data)
    }
    if (showLoading) setLoading(false)
  }

  useEffect(() => {
    fetchTables(true)
  }, [])

  const branchId = user?.branchId

  // WebSocket: silent refresh when any table changes (occupy, clear, new QR order)
  const tableUpdateTopic = branchId ? `/topic/branch/${branchId}/table-update` : null
  const handleTableUpdate = useCallback(() => { fetchTables(false) }, [])
  useWebSocket(branchId, tableUpdateTopic, handleTableUpdate)

  // WebSocket: reservation reminders (1hr and 15min before)
  const reminderTopic = branchId ? `/topic/branch/${branchId}/reservation-reminder` : null
  const handleReservationReminder = useCallback((msg) => {
    const tableNo = msg.tableNumber
    const time = msg.reservationTime
    if (msg.type === 'REMINDER_1HR') {
      toast.info(`Table ${tableNo} has a reservation at ${time} — 1 hour away.`, { autoClose: 10000 })
    } else if (msg.type === 'REMINDER_30MIN') {
      toast.info(`Table ${tableNo} reservation at ${time} is in 30 minutes.`, { autoClose: 10000 })
    } else if (msg.type === 'REMINDER_15MIN') {
      toast.warning(`Table ${tableNo} reservation at ${time} is in 15 minutes — table is now locked!`, { autoClose: 15000 })
    }
  }, [])
  useWebSocket(branchId, reminderTopic, handleReservationReminder)

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-orange-600" />
        <p className="animate-pulse text-sm font-bold tracking-widest text-gray-400 uppercase">
          Syncing Floor Map...
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-4">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-end gap-3">
        <button
          onClick={() => setIsReservationsListOpen(true)}
          className="flex items-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-bold text-purple-700 hover:bg-purple-100 transition-colors"
        >
          <CalendarDays size={16} />
          See Reservations
        </button>
        <button
          onClick={() => setIsReservationModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-orange-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-200"
        >
          <CalendarPlus size={16} />
          Reserve
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onClick={(t) => {
              setSelectedTable(t)
              setIsActionModalOpen(true)
            }}
          />
        ))}
      </div>

      <TableActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        table={selectedTable}
        onUpdate={() => fetchTables(false)}
      />

      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        tables={tables}
        onSuccess={() => fetchTables(false)}
      />

      <ReservationsListModal
        isOpen={isReservationsListOpen}
        onClose={() => setIsReservationsListOpen(false)}
      />
    </div>
  )
}

export default TableManagementPage
