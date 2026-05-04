import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ClipboardCheck } from 'lucide-react' // Using ClipboardCheck for approvals

const ApprovalsPage = () => {
  const { setHeaderInfo } = useOutletContext()

  useEffect(() => {
    setHeaderInfo({
      title: 'Approvals',
      description: 'Review pending requests.',
      Icon: ClipboardCheck,
    })
  }, [setHeaderInfo])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-6">
      <h1 className="text-xl font-bold text-gray-900">Pending Approvals</h1>
      {/* Content goes here */}
    </div>
  )
}

export default ApprovalsPage
