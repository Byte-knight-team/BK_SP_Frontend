import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'

const OrderManagementPage = () => {
  const { setHeaderInfo } = useOutletContext()

  useEffect(() => {
    setHeaderInfo({
      title: 'Order Management',
      description: 'Track live orders, manage payments, and update order statuses.',
      Icon: ClipboardList,
    })
  }, [setHeaderInfo])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-6">
      <h1 className="text-xl font-bold text-gray-900">Live Orders Overview</h1>
    </div>
  )
}

export default OrderManagementPage
