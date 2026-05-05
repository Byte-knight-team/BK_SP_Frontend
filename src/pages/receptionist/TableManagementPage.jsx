import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'react-toastify' 
import TableCard from '../../components/receptionist/table management/TableCard'
import TableActionModal from '../../components/receptionist/table management/TableActionModal'
import { LayoutGrid } from 'lucide-react'
import { getBranchTablesAPI } from "../../apis/receptionist/tables";

const TableManagementPage = () => {
  const { setHeaderInfo } = useOutletContext();
  const [selectedTable, setSelectedTable] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHeaderInfo({
      title: 'Table Management',
      description: 'Monitor live table status and manage guest seating.',
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

      {/* Table Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onClick={(t) => {
              setSelectedTable(t);
              setIsActionModalOpen(true);
            }}
          />
        ))}
      </div>

      <TableActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        table={selectedTable}
        onUpdate={() => fetchTables(false)} // Background refresh after action!
      />
    </div>
  )
}

export default TableManagementPage
