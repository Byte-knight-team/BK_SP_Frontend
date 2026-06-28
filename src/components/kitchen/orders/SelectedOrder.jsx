import { useState, useEffect, useRef } from 'react'
import OrderStepper from '../OrderStepper'
import MealTable from './MealTable'
import { AlertCircle } from 'lucide-react'
import AssignChefModal from './AssignChefModal'
import HoldOrderModal from './HoldOrderModal'

import {
  getOrderDetailsAPI,
  assignChefToMealAPI,
  holdOrderAPI,
} from '../../../apis/kitchen/orders'
import { toast } from 'react-toastify'

const statusLabels = {
  PENDING: 'Placed on',
  PREPARING: 'Preparing started at',
  COMPLETED: 'Completed at',
  ON_HOLD: 'Hold at',
}

const statusColors = {
  PENDING: 'bg-orange-50 text-orange-500',
  PREPARING: 'bg-blue-50 text-blue-500',
  COMPLETED: 'bg-green-50 text-green-500',
  ON_HOLD: 'bg-red-50 text-red-600',
}

const SelectedOrder = ({ orderId, setActiveTab, refreshKey }) => {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isChefAssignModalOpen, setIsChefAssignModalOpen] = useState(false)
  const [targetMeal, setTargetMeal] = useState(null)
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false)

  const prevStatusRef = useRef(null)

  const fetchOrderDetails = async (showLoading = true) => {
    if (!orderId) return
    if (showLoading) setLoading(true)

    const { data, error } = await getOrderDetailsAPI(orderId)

    if (error) {
      console.error('Error fetching order details:', error)
    } else if (data) {
      // On silent refresh only: detect status transition and switch the parent tab
      if (!showLoading && prevStatusRef.current) {
        const prev = prevStatusRef.current
        const next = data.status
        if (prev === 'PENDING' && next === 'PREPARING') setActiveTab(2)
        else if (prev === 'PREPARING' && next === 'COMPLETED') setActiveTab(3)
      }
      prevStatusRef.current = data.status

      setOrder({
        id: data.orderNumber,
        time: new Date(data.statusUpdatedAt).toLocaleString(),
        status: data.status,
        holdReason: data.holdReason || '',
        kitchenNote: data.kitchenNotes || '',
        meals: data.items.map((item) => ({
          id: item.id,
          name: item.itemName,
          qty: item.quantity,
          status: item.status,
          chefName: item.assignedLineChefName || 'Not Assigned',
        })),
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    prevStatusRef.current = null  // reset when a different order is selected
    fetchOrderDetails(true)
  }, [orderId])

  // Silent background refresh when a line chef starts/completes an item
  useEffect(() => {
    if (refreshKey > 0) fetchOrderDetails(false)
  }, [refreshKey])

  const handleChefAssignment = async (chefStaffId) => {
    if (!targetMeal) return

    const { error } = await assignChefToMealAPI(targetMeal.id, chefStaffId)

    if (error) {
      toast.error('Failed to assign line chef.')
    } else {
      toast.success('Line chef assigned successfully!')
      setIsChefAssignModalOpen(false)
      fetchOrderDetails(false)
    }
  }

  const handleAssignChef = (meal) => {
    setTargetMeal(meal)
    setIsChefAssignModalOpen(true)
  }

  const handleHoldOrder = async (reason) => {
    const { error } = await holdOrderAPI(orderId, reason)

    if (!error) {
      toast.success('Order put on hold successfully.')
      setIsHoldModalOpen(false)
      fetchOrderDetails(false)
      setActiveTab(4)
    } else {
      toast.error('Failed to hold order. Please try again.')
    }
  }

  if (loading)
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="animate-pulse text-lg font-bold text-orange-400">
          Loading Order Details...
        </p>
      </div>
    )

  if (!order)
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="italic text-gray-400">
          Select an order from the list to view details.
        </p>
      </div>
    )

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Order {order.id}</h1>
          <p className="mt-1 text-sm font-medium text-gray-400">
            {statusLabels[order.status]} {order.time}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase ${
              statusColors[order.status] || 'bg-gray-50 text-gray-500'
            }`}
          >
            {order.status.replace('_', ' ').toUpperCase()}
          </span>

          {order.status === 'PENDING' && (
            <button
              onClick={() => setIsHoldModalOpen(true)}
              className="flex items-center gap-1 rounded-full border border-red-100 px-4 py-1.5 text-[10px] font-bold text-red-500 transition-all hover:bg-red-50"
            >
              <AlertCircle size={18} /> Hold Order
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        {order.status === 'ON_HOLD' ? (
          <div className="flex items-start gap-4 rounded-2xl border border-red-100 bg-red-50 p-6">
            <AlertCircle size={24} className="mt-0.5 text-red-500" />
            <div>
              <h3 className="font-bold text-red-800">Awaiting Action</h3>
              <p className="mt-1 text-xs text-red-500">
                Reason: {order.holdReason || 'Not specified'}
              </p>
            </div>
          </div>
        ) : (
          <OrderStepper status={order.status} />
        )}
      </div>

      {order.kitchenNote && (
        <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-left shadow-sm">
          <p className="text-sm font-medium text-orange-800">
            <span className="mr-2 text-xs font-bold tracking-wider text-orange-500 uppercase">
              Note:
            </span>
            {order.kitchenNote}
          </p>
        </div>
      )}

      <div className="mt-5">
        <MealTable
          mealsData={order.meals}
          orderStatus={order.status}
          onAssignChef={handleAssignChef}
        />
      </div>

      <AssignChefModal
        isOpen={isChefAssignModalOpen}
        onClose={() => setIsChefAssignModalOpen(false)}
        onAssign={handleChefAssignment}
        mealName={targetMeal?.name}
      />

      <HoldOrderModal
        isOpen={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
        onConfirm={handleHoldOrder}
      />
    </div>
  )
}

export default SelectedOrder
