import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'react-toastify' 
import TableCard from '../../components/receptionist/table management/TableCard'
import TableActionModal from '../../components/receptionist/table management/TableActionModal'
import ReservationModal from '../../components/receptionist/table management/ReservationModal'
import { PlusCircle, LayoutGrid } from 'lucide-react'
import { getBranchTablesAPI } from "../../apis/receptionist/tables";

const TableManagementPage = () => {
  const { setHeaderInfo } = useOutletContext();
  const [selectedTable, setSelectedTable] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHeaderInfo({
      title: 'Table Management',
      description: 'Monitor live table status, manage guest seating, and handle reservations.',
      Icon: LayoutGrid,
    })
  }, [setHeaderInfo])

  // Fetch tables on component mount
  const fetchTables = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const { data, error } = await getBranchTablesAPI();
    if (error) {
      toast.error("Error: Could not sync with live table status");
    } else if (data) {
      setTables(data);
    }
    if (showLoading) setLoading(false);
  };

  // Initial load
  useEffect(() => {
    fetchTables(true);

    // Polling for live updates (silent background fetch)
    const interval = setInterval(() => fetchTables(false), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-orange-600"></div>
        <p className="animate-pulse text-sm font-bold tracking-widest text-gray-400 uppercase">
          Syncing Floor Map...
        </p>
      </div>
    );
  }

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
        onUpdate={() => fetchTables(false)} // Background refresh after action!
      />

      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        tables={tables} // passing the tables to the modal to be displayed in the dropdown
        onSave={() => fetchTables(false)} // Background refresh after booking!
      />
    </div>
  )
}

export default TableManagementPage
