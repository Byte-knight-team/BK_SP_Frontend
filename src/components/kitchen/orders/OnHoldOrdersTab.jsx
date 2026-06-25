import OrderCard from '../OrderCard'
import { useState, useEffect } from 'react'
import { getOrderCardsAPI } from '../../../apis/kitchen/orders'
import { toast } from 'react-toastify'

const OnHoldOrdersTab = ({ handleOrderClick, selectedOrderId }) => {
  const [onHoldOrdersDetails, setOnHoldOrdersDetails] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchOnHoldOrdersDetails = async () => {
      //enable loading
      setLoading(true)
      //api call
      const { data, error } = await getOrderCardsAPI('ON_HOLD')
      //handle error
      if (error) {
        toast.error("Error fetching on hold orders");
        return
      }
      //handle success
      if (data) {
        setOnHoldOrdersDetails(data)
      }
      //disable loading
      setLoading(false)
    }

    fetchOnHoldOrdersDetails()
  }, [])

  if (loading) {
    return (
      <p className="animate-pulse py-8 text-center text-sm font-bold text-orange-400">
        Loading On Hold Orders...
      </p>
    )
  }

  if (onHoldOrdersDetails.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-300">
        No on hold orders right now
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {onHoldOrdersDetails.map((order) => (
        <OrderCard
          key={order.id}
          status={order.status}
          time={order.time}
          id={order.orderNumber}
          numberOfItems={order.itemCount}
          onClick={() => handleOrderClick(order.id)}
          //if the order is already selected, highlight it
          isSelected={order.id === selectedOrderId}
        />
      ))}
    </div>
  )
}

export default OnHoldOrdersTab
