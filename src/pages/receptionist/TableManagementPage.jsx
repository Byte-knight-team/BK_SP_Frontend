import { useState } from 'react'
import TableCard from '../../components/receptionist/table management/TableCard'
import TableActionModal from '../../components/receptionist/table management/TableActionModal'
import ReservationModal from '../../components/receptionist/table management/ReservationModal'
import { PlusCircle, Search, Filter } from 'lucide-react'

const TableManagementPage = () => {
  const [selectedTable, setSelectedTable] = useState(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false) // For Table Actions
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false) // For New Reservations

  // --- MOCK DATA ---
  const [tables, setTables] = useState([
    {
      id: 101,
      tableNumber: 1,
      capacity: 4,
      status: 'AVAILABLE',
      currentGuestCount: 0,
      activeOrderCount: 0,
    },
    {
      id: 102,
      tableNumber: 2,
      capacity: 2,
      status: 'OCCUPIED',
      currentGuestCount: 2,
      activeOrderCount: 1,
    },
    {
      id: 103,
      tableNumber: 3,
      capacity: 6,
      status: 'RESERVED',
      currentGuestCount: 0,
      activeOrderCount: 0,
    },
    {
      id: 104,
      tableNumber: 4,
      capacity: 4,
      status: 'OCCUPIED',
      currentGuestCount: 4,
      activeOrderCount: 3,
    },
    {
      id: 105,
      tableNumber: 5,
      capacity: 8,
      status: 'AVAILABLE',
      currentGuestCount: 0,
      activeOrderCount: 0,
    },
  ])

  const handleCardClick = (table) => {
    setSelectedTable(table)
    setIsModalOpen(true)
  }

  const handleSaveReservation = (data) => {
    console.log('Reservation Saved to state:', data)
    // In the future, we will push this to the backend
  }

  const handleRefresh = () => {
    console.log('Refreshing table data...')
    // This will call the real API later
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      {/* Header Section */}
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Table Management
          </h1>
          <p className="text-sm font-bold tracking-widest text-gray-500 uppercase">
            Branch 01 • Live Floor Map
          </p>
        </div>

        {/* BOOK A TABLE BUTTON */}
        <button
          onClick={() => setIsReservationModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-black px-6 py-4 font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <PlusCircle size={20} />
          BOOK A TABLE
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by table number..."
            className="w-full rounded-2xl border-none bg-white py-4 pr-4 pl-12 font-bold text-gray-700 shadow-sm transition-all focus:ring-2 focus:ring-black"
          />
        </div>
        <button className="flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-gray-600 shadow-sm hover:bg-gray-50">
          <Filter size={18} />
          ALL TABLES
        </button>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => (
          <TableCard key={table.id} table={table} onClick={handleCardClick} />
        ))}
      </div>

      {/* The Action Modal */}
      <TableActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        table={selectedTable}
        onUpdate={() => console.log('Refresh Grid')}
      />

      {/* The Reservation Modal */}
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        tables={tables}
        onSave={handleSaveReservation}
      />
    </div>
  )
}

export default TableManagementPage
