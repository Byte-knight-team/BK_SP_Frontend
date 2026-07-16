export default function PurchaseOrderTab({ purchaseOrders, loading, refetch }) {
  if (loading) return <div className="p-8 text-center text-gray-500">Loading purchase orders...</div>

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold mb-4">Purchase Orders</h2>
      <p className="text-gray-500 text-sm">Purchase order list will go here.</p>
    </div>
  )
}
