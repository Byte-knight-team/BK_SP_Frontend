import { useState } from 'react'
import { Search, History } from 'lucide-react'

export default function PurchaseOrderLogTable({ poLogs, loading }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredLogs = (poLogs || []).filter((log) => {
    const matchesSearch = 
      (log.poNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.actionByName || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusStyle = (status) => {
    switch(status) {
      case 'SUBMITTED': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'PARTIALLY_RECEIVED': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'RECEIVED': return 'bg-green-50 text-green-700 border-green-200'
      case 'CANCELLED': return 'bg-gray-100 text-gray-600 border-gray-300'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (loading && !poLogs) return <div className="p-8 text-center text-gray-500">Loading log data...</div>

  return (
    <div className="card">
      <div className="p-5 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">Purchase Order Log</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium text-gray-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="PARTIALLY_RECEIVED">Partially Received</option>
            <option value="RECEIVED">Received</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <div className="flex w-full sm:w-64 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search PO, vendor, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-100 text-xs tracking-wider text-gray-400 uppercase bg-gray-50/50">
              <th className="px-6 py-4 font-semibold">Date / Time</th>
              <th className="px-6 py-4 font-semibold">PO Number</th>
              <th className="px-6 py-4 font-semibold">Vendor</th>
              <th className="px-6 py-4 font-semibold">Action By</th>
              <th className="px-6 py-4 font-semibold text-center">Status Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{log.poNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {log.vendorName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {log.actionByName}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(log.status)}`}>
                      {log.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                  No log records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
