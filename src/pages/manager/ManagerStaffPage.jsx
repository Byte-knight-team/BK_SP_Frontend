import React from 'react'
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center max-w-md mx-auto">
        <div className="p-4 bg-red-50 rounded-full text-red-500">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to Load Staff</h3>
          <p className="text-gray-500">{error}</p>
        </div>
        <button 
          onClick={refetch}
          className="bg-brand text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand/20 hover:scale-105 transition-all"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <StaffHeader />
      
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
