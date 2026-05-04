import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'

const ReceptionistDashboardPage = () => {
  const { setHeaderInfo } = useOutletContext()

  useEffect(() => {
    setHeaderInfo({
      title: 'Receptionist Dashboard',
      description: 'Quick overview of restaurant performance and active guest metrics.',
      Icon: LayoutDashboard,
    })
  }, [setHeaderInfo])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-6">
      <h1 className="text-xl font-bold text-gray-900">Live Dashboard</h1>
    </div>
  )
}

export default ReceptionistDashboardPage
