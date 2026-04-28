import { useState, useMemo } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import Badge from '../ui/Badge'

export default function StaffDetailsTable({ staff = [] }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const PAGE_SIZE = 10

  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      const name = member.name || '';
      const userId = String(member.userId || '');
      const role = member.role || '';

      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           userId.includes(searchQuery);
      
      const matchesFilter = activeFilter === 'All' || 
                           (activeFilter === 'Chef' && role === 'Kitchen Staff') ||
                           (activeFilter === 'Delivery' && role === 'Delivery Driver') ||
                           (activeFilter === 'Wait Staff' && role === 'Receptionist');

      return matchesSearch && matchesFilter;
    });
  }, [staff, searchQuery, activeFilter]);

  const filters = ['All', 'Chef', 'Delivery', 'Wait Staff']

  return (
    <div className="bg-white rounded-4xl border border-gray-100 shadow-sm p-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-brand rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900">Staff Details</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Filters */}
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeFilter === filter 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand transition-colors" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-6 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all w-64"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-50">
              <th className="pb-4 px-4 w-[25%] font-medium">Staff Member</th>
              <th className="pb-4 px-4 w-[15%] font-medium">Role</th>
              <th className="pb-4 px-4 w-[15%] font-medium">Hire Date</th>
              <th className="pb-4 px-4 w-[20%] font-medium">Contact Number</th>
              <th className="pb-4 px-4 w-[15%] font-medium">Salary</th>
              <th className="pb-4 px-4 w-[10%] text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredStaff.slice(0, PAGE_SIZE).map((member) => (
              <tr key={member.userId} className="group hover:bg-gray-50/50 transition-colors">
                <td className="py-5 px-4">
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-bold text-sm">{member.name}</span>
                    <span className="text-gray-400 text-[10px] font-bold mt-0.5">USER ID : {member.userId}</span>
                  </div>
                </td>
                <td className="py-5 px-4 text-sm font-medium text-gray-500">
                  {member.role}
                </td>
                <td className="py-5 px-4 text-sm font-bold text-gray-400">
                  {member.hireDate}
                </td>
                <td className="py-5 px-4 text-sm font-bold text-gray-900">
                  {member.contactNumber}
                </td>
                <td className="py-5 px-4 text-sm font-bold text-gray-900">
                  Rs. {Number(member.salary || 0).toLocaleString()}
                </td>
                <td className="py-5 px-4 text-right">
                  <Badge status={(member.status || 'ACTIVE').toLowerCase()} />
                </td>
              </tr>
            ))}

            {/* Static Height Spacers */}
            {filteredStaff.length < PAGE_SIZE && filteredStaff.length > 0 && (
              <tr style={{ height: `${(PAGE_SIZE - filteredStaff.length) * 76}px` }}>
                <td colSpan={6}></td>
              </tr>
            )}

            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-gray-50 rounded-full">
                      <Search className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-medium">No staff members found matching your search.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-center">
        <button className="text-brand font-bold text-sm hover:underline transition-all flex items-center gap-1 group">
          View more
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  )
}
