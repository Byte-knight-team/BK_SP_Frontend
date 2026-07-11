import { useEffect, useState } from 'react'
import { LayoutGrid } from 'lucide-react'
import { getBranchTablesAPI } from '../../../apis/receptionist/tables'

const STATUS_CONFIG = {
  AVAILABLE: { bg: 'bg-green-500', label: 'Available' },
  OCCUPIED:  { bg: 'bg-red-500',   label: 'Occupied'  },
  RESERVED:  { bg: 'bg-purple-500',label: 'Reserved'  },
}

const TableGridCard = ({ refreshKey = 0 }) => {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTables = async () => {
      const { data } = await getBranchTablesAPI()
      if (data) setTables(data)
      setLoading(false)
    }
    fetchTables()
  }, [refreshKey])

  const counts = {
    AVAILABLE: tables.filter(t => t.status?.toUpperCase() === 'AVAILABLE').length,
    OCCUPIED:  tables.filter(t => t.status?.toUpperCase() === 'OCCUPIED').length,
    RESERVED:  tables.filter(t => t.status?.toUpperCase() === 'RESERVED').length,
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex items-center justify-center rounded-xl bg-orange-50 p-2">
          <LayoutGrid size={18} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-800">Table Status</h2>
          <p className="text-xs text-gray-400">{tables.length} tables total</p>
        </div>
      </div>

      {loading ? (
        <div className="grid flex-1 grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square w-full animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          {/* Big squares, vertically centered to fill the card */}
          <div className="flex flex-1 items-center">
            <div className="grid w-full grid-cols-4 gap-3">
              {tables.map((table) => {
                const status = table.status?.toUpperCase() || 'AVAILABLE'
                const config = STATUS_CONFIG[status] || { bg: 'bg-gray-300' }
                return (
                  <div
                    key={table.id}
                    className={`flex aspect-square items-center justify-center rounded-2xl ${config.bg}`}
                    title={`Table ${table.tableNumber} — ${config.label}`}
                  >
                    <span className="text-lg font-black text-white">{table.tableNumber}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${config.bg}`} />
                <span className="text-xs font-semibold text-gray-500">
                  {config.label} ({counts[status]})
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default TableGridCard
