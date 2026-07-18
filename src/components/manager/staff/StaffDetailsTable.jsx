import { useState, useMemo } from 'react'
import { Search, ChevronRight, ChevronLeft, SlidersHorizontal } from 'lucide-react'
import Badge from '../ui/Badge'

export default function StaffDetailsTable({ staff = [] }) {
  const [activeFilter, setActiveFilter] = useState('All Roles')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const PAGE_SIZE = 8

  const filters = ['All Roles', 'Main Chef', 'Line Chef', 'Delivery Driver', 'Receptionist', 'Manager']

  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      const name = member.name || '';
      const userId = String(member.userId || '');
      const role = member.role || '';

      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           userId.includes(searchQuery);
      
      const matchesFilter = activeFilter === 'All Roles' || role === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [staff, searchQuery, activeFilter]);

  // Pagination Logic matching CurrentStockTable
  const displayedItems = useMemo(() => {
    if (currentPage === 0) {
      return filteredStaff.slice(0, 5) // Initial view: 5 items
    }
    const start = (currentPage - 1) * PAGE_SIZE
    const end = currentPage * PAGE_SIZE
    return filteredStaff.slice(start, end)
  }, [filteredStaff, currentPage])

  const emptyRowsCount = currentPage > 0 ? PAGE_SIZE - displayedItems.length : 0

  const handleViewMore = () => {
    setCurrentPage(1)
  }

  return (
    <div className="card">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Staff Details</h2>
          <span className="bg-brand text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {staff.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 w-56">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Filter Dropdown matching Inventory style */}
          <div className="relative">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 outline-none appearance-none cursor-pointer pr-4"
              >
                {filters.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-100 text-xs tracking-wider text-gray-400 uppercase bg-gray-50/50">
              <th className="px-6 py-4 font-semibold w-[25%]">Staff Member</th>
              <th className="px-6 py-4 font-semibold w-[15%] text-center">Role</th>
              <th className="px-6 py-4 font-semibold w-[20%]">Joined Date</th>
              <th className="px-6 py-4 font-semibold w-[25%]">Contact</th>
              <th className="px-6 py-4 font-semibold w-[15%] text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayedItems.map((member) => (
              <tr key={member.userId} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-400">ID: {member.userId}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {member.joinedDate}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  {member.contactNumber}
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge status={(member.status || 'ACTIVE').toLowerCase()} />
                </td>
              </tr>
            ))}

            {/* Static Height Spacers */}
            {emptyRowsCount > 0 &&
              Array.from({ length: emptyRowsCount }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="h-[73px]">
                  <td colSpan={5}>&nbsp;</td>
                </tr>
              ))}

            {displayedItems.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                  No staff members match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer matching CurrentStockTable */}
      <div className="mt-6 flex items-center justify-center border-t border-gray-50 pt-5">
        {currentPage === 0 ? (
          filteredStaff.length > 5 && (
            <button
              onClick={handleViewMore}
              className="text-sm text-brand font-bold hover:underline inline-flex items-center gap-1 transition-all"
            >
              View more
            </button>
          )
        ) : (
          <div className="flex items-center gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-md">
              Page {currentPage}
            </span>

            <button
              disabled={currentPage * PAGE_SIZE >= filteredStaff.length}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
