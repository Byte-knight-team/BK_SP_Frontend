export default function GoodsReceiptNoteTab({ grns, loading, refetch }) {
  if (loading) return <div className="p-8 text-center text-gray-500">Loading GRNs...</div>

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold mb-4">Goods Receipt Notes (GRN)</h2>
      <p className="text-gray-500 text-sm">GRN history table will go here.</p>
    </div>
  )
}
