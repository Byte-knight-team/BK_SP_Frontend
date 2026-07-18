import { useStaffData } from '../../hooks/useStaffData'
import StaffHeader from '../../components/manager/staff/StaffHeader'
import StaffSummaryCards from '../../components/manager/staff/StaffSummaryCards'
import StaffDetailsTable from '../../components/manager/staff/StaffDetailsTable'
import { Loader2, AlertCircle } from 'lucide-react'

export default function ManagerStaffPage() {
  const { data, loading, error, refetch } = useStaffData()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Loading staff records...</p>
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
        chefCount={data?.chefCount || 0}
        lineChefCount={data?.lineChefCount || 0}
        deliveryCount={data?.deliveryCount || 0}
        receptionistCount={data?.receptionistCount || 0}
      />

      <StaffDetailsTable 
        staff={data?.staffMembers || []}
      />
    </div>
  )
}
