import { useState, useEffect, useCallback } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { LayoutGrid, CalendarPlus, CalendarDays } from 'lucide-react'
import TableCard from '../../components/receptionist/table management/TableCard'
import TableActionModal from '../../components/receptionist/table management/TableActionModal'
import ReservationBookingPanel from '../../components/receptionist/table management/ReservationBookingPanel'
import { getBranchTablesAPI } from '../../apis/receptionist/tables'
import { useAuth } from '../../context/AuthContext'
import useWebSocket from '../../hooks/useWebSocket'

const TableManagementPage = () => {
  const { setHeaderInfo } = useOutletContext()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedTable, setSelectedTable] = useState(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
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

  // Reservation reminders (1hr/30min/15min, guest-late, time's-up) toast globally via
  // ReceptionistNotifier now. The 15-min table lock still arrives here through table-update.

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
          onClick={() => navigate('/receptionist/reservations')}
          className="flex items-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-bold text-purple-700 hover:bg-purple-100 transition-colors"
        >
          <CalendarDays size={16} />
          See Reservations
        </button>
        <button
          onClick={() => setIsBookingOpen((v) => !v)}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold shadow-lg transition-colors ${
            isBookingOpen
              ? 'bg-orange-100 text-orange-700 shadow-orange-100'
              : 'bg-orange-600 text-white shadow-orange-200'
          }`}
        >
          <CalendarPlus size={16} />
          {isBookingOpen ? 'Close Booking' : 'Reserve'}
        </button>
      </div>

      <div className="flex gap-4">
        {/* Table grid — reflows from 4 cols to 3 when the booking panel is open */}
        <div
          className={`grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 ${
            isBookingOpen ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'
          }`}
        >
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

        {/* Inline booking panel — no blur, tables stay visible */}
        {isBookingOpen && (
          <div className="sticky top-4 self-start">
            <ReservationBookingPanel
              tables={tables}
              onClose={() => setIsBookingOpen(false)}
              onSuccess={() => fetchTables(false)}
            />
          </div>
        )}
      </div>

      <TableActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        table={selectedTable}
        onUpdate={() => fetchTables(false)}
      />
    </div>
  )
}

export default TableManagementPage
