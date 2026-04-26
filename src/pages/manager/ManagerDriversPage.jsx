import { useState } from 'react'
import { useDriversData } from '../../hooks/useDriversData'
import DriversHeader from '../../components/manager/drivers/DriversHeader'
import DriversSummaryCards from '../../components/manager/drivers/DriversSummaryCards'
import DispatchHub from '../../components/manager/drivers/DispatchHub'
import DriverStatusBoard from '../../components/manager/drivers/DriverStatusBoard'
import AssignDriverModal from '../../components/manager/drivers/AssignDriverModal'

function LoadingSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-72" />
      <div className="grid grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="h-64 bg-gray-200 rounded-2xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  )
}

export default function ManagerDriversPage() {
  const { data, loading } = useDriversData()
  const [assignModal, setAssignModal] = useState({
    open: false,
    order: null,
  })

  if (loading) return <LoadingSkeleton />

  const handleAssignDriver = (order) => {
    setAssignModal({ open: true, order })
  }

  const handleConfirmAssign = (orderId, driverId) => {
    console.log(`Assigning driver ${driverId} to order ${orderId}`)
    // TODO: POST to backend API
    setAssignModal({ open: false, order: null })
  }

  const availableDrivers = data.drivers.filter((d) => d.status === 'Available')

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <DriversHeader />

      <DriversSummaryCards
        driversOnline={data.driversOnline}
        available={data.available}
        busy={data.busy}
        pendingDispatch={data.pendingDispatch}
      />

      <DispatchHub
        orders={data.dispatchOrders}
        onAssignDriver={handleAssignDriver}
      />
      <DriverStatusBoard drivers={data.drivers} />

      {/* Assign Driver Modal */}
      <AssignDriverModal
        isOpen={assignModal.open}
        onClose={() => setAssignModal({ open: false, order: null })}
        order={assignModal.order}
        availableDrivers={availableDrivers}
        onConfirm={handleConfirmAssign}
      />
    </div>
  )
}
