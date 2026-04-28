import { useStaffData } from '../../hooks/useStaffData'
import StaffHeader from '../../components/manager/staff/StaffHeader'
import StaffSummaryCards from '../../components/manager/staff/StaffSummaryCards'
import StaffDetailsTable from '../../components/manager/staff/StaffDetailsTable'
import { Loader2, AlertCircle } from 'lucide-react'

export default function ManagerStaffPage() {
  const { data, loading, error, refetch } = useStaffData()

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-72" />
        <div className="grid grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500 font-medium">Failed to load staff: {error}</div>
        <button 
          onClick={refetch}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
      <StaffHeader branchName={data?.branchName} />
      
      <StaffSummaryCards 
        kitchenCount={data?.kitchenCount || 0}
        deliveryCount={data?.deliveryCount || 0}
        receptionistCount={data?.receptionistCount || 0}
      />

      <StaffDetailsTable 
        staff={data?.staffMembers || []}
      />
    </div>
  )
}
