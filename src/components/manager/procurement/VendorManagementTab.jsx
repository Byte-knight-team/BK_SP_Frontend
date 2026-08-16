import { useState } from 'react'
import { Search, Building2, Phone, Mail, Edit, Trash2 } from 'lucide-react'
import VendorModal from './VendorModal'
import { ProcurementService } from '../../../apis/manager/ProcurementService'
import { toast } from 'react-toastify'

export default function VendorManagementTab({ vendors, loading, refetch }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [vendorToEdit, setVendorToEdit] = useState(null)

  const filteredVendors = (vendors || []).filter((v) =>
    (v.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this vendor?')) {
      try {
        await ProcurementService.deactivateVendor(id)
        toast.success('Vendor deactivated successfully')
        refetch()
      } catch (err) {
        toast.error(err.message || 'Failed to deactivate vendor')
      }
    }
  }

  if (loading && !vendors) return <div className="p-8 text-center text-gray-500">Loading vendors...</div>

  return (
    <div className="card">
      <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Vendor Directory</h2>
        
        <div className="flex w-full sm:w-64 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs tracking-wider text-gray-400 uppercase bg-gray-50/50">
              <th className="px-6 py-4 text-left font-semibold">Vendor Name</th>
              <th className="px-6 py-4 text-left font-semibold">Contact Info</th>
              <th className="px-6 py-4 text-center font-semibold">Category</th>
              <th className="px-6 py-4 text-center font-semibold">Active POs</th>
              <th className="px-6 py-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredVendors.length > 0 ? (
              filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{vendor.name}</p>
                        <p className="text-xs text-gray-500 truncate w-48">{vendor.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs">{vendor.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs">{vendor.email || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      {vendor.category || 'Other'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {vendor.activePoCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                        {vendor.activePoCount} Pending
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setVendorToEdit(vendor)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Vendor"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(vendor.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Deactivate Vendor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                  No vendors found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <VendorModal
        isOpen={!!vendorToEdit}
        onClose={() => setVendorToEdit(null)}
        vendorToEdit={vendorToEdit}
        onSuccess={refetch}
      />
    </div>
  )
}
