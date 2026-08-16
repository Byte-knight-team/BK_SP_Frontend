import { useStaffData } from '../../hooks/useStaffData'
import StaffHeader from '../../components/manager/staff/StaffHeader'
import StaffSummaryCards from '../../components/manager/staff/StaffSummaryCards'
import StaffDetailsTable from '../../components/manager/staff/StaffDetailsTable'
import { Loader2, AlertCircle } from 'lucide-react'

export default function ManagerStaffPage() {
  const { data, loading, error, refetch } = useStaffData()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand h-10 w-10 animate-spin" />
        <p className="animate-pulse font-medium text-gray-500">
          Loading staff records...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center space-y-4">
        <div className="font-medium text-red-500">
          Failed to load staff: {error}
        </div>
        <button onClick={refetch} className="btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 mx-auto max-w-7xl space-y-6 duration-500">
      <StaffHeader branchName={data?.branchName} />

      <StaffSummaryCards
        chefCount={data?.chefCount || 0}
        lineChefCount={data?.lineChefCount || 0}
        deliveryCount={data?.deliveryCount || 0}
        receptionistCount={data?.receptionistCount || 0}
      />

      <StaffDetailsTable staff={data?.staffMembers || []} />
    </div>
  )
}
