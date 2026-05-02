import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import TableCard from '../../components/receptionist/table management/TableCard'
import TableActionModal from '../../components/receptionist/table management/TableActionModal'
import ReservationModal from '../../components/receptionist/table management/ReservationModal'
import { PlusCircle, LayoutGrid } from 'lucide-react'

const TableManagementPage = () => {
  const { setHeaderInfo } = useOutletContext()
  const [selectedTable, setSelectedTable] = useState(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)

  useEffect(() => {
    setHeaderInfo({
      title: 'Table Management',
      description: 'Monitor live table status, manage guest seating, and handle reservations.',
      Icon: LayoutGrid,
    })
  }, [setHeaderInfo])

  const [tables] = useState([
    { id: 101, tableNumber: 1, capacity: 4, status: 'AVAILABLE', currentGuestCount: 0, activeOrderCount: 0 },
    { id: 102, tableNumber: 2, capacity: 4, status: 'OCCUPIED', currentGuestCount: 2, activeOrderCount: 1 },
    { id: 103, tableNumber: 3, capacity: 6, status: 'RESERVED', currentGuestCount: 0, activeOrderCount: 0 },
    { id: 104, tableNumber: 4, capacity: 4, status: 'OCCUPIED', currentGuestCount: 4, activeOrderCount: 3 },
  ])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-4">
      
      {/* Book a Table Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsReservationModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-orange-600 px-8 py-4 font-bold text-white shadow-xl hover:bg-orange-700"
        >
          <PlusCircle size={20} />
          BOOK A TABLE
        </button>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => (
          <TableCard key={table.id} table={table} onClick={(t) => {
            setSelectedTable(t);
            setIsActionModalOpen(true);
          }} />
        ))}
      </div>

      <TableActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        table={selectedTable}
        onUpdate={() => console.log('Update')}
      />

      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        tables={tables}
        onSave={(d) => console.log('Saved', d)}
      />
    </div>
  )
}

export default TableManagementPage
