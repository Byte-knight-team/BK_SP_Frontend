export default function VendorManagementTab({ vendors, loading, refetch }) {
  if (loading) return <div className="p-8 text-center text-gray-500">Loading vendors...</div>

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold mb-4">Vendor Directory</h2>
      <p className="text-gray-500 text-sm">Vendor management table will go here.</p>
    </div>
  )
}
