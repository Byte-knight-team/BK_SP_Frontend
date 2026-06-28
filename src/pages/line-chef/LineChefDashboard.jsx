import { useState, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import useWebSocket from '../../hooks/useWebSocket'
import AssignedItemCard from '../../components/line-chef/AssignedItemCard'
import { getMyItemsAPI, startItemAPI, completeItemAPI } from '../../apis/line-chef/items'

const TABS = [
  { key: 'PENDING', label: 'To Cook' },
  { key: 'PREPARING', label: 'Cooking' },
  { key: 'READY', label: 'Done' },
]

const sortItems = (items, status) => {
  if (status === 'READY') {
    return [...items].sort((a, b) => b.itemId - a.itemId) // newest first
  }
  return [...items].sort((a, b) => a.itemId - b.itemId) // oldest first
}

export default function LineChefDashboard() {
  const { setHeaderInfo } = useOutletContext()
  const { user } = useAuth()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('PENDING')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    setHeaderInfo({
      title: 'My Items',
      description: 'Items assigned to you for preparation.',
      Icon: ClipboardList,
    })
  }, [setHeaderInfo])

  const fetchItems = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    const { data, error } = await getMyItemsAPI()
    if (data) {
      setItems(data)
    } else {
      console.error('Failed to fetch items:', error)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchItems(true)
  }, [fetchItems])

  // WebSocket: notified when chief chef assigns a new item
  const wsTopicUserId = user?.id
  const wsTopic = wsTopicUserId
    ? `/topic/line-chef/${wsTopicUserId}/new-item`
    : null

  useWebSocket(user?.branchId, wsTopic, (msg) => {
    toast.info(`New item assigned: ${msg.itemName} (Order ${msg.orderNumber})`, {
      autoClose: 6000,
    })
    fetchItems(false)
  })

  const handleStart = async (itemId) => {
    setActionLoading(true)
    const { error } = await startItemAPI(itemId)
    if (error) {
      toast.error('Failed to start item.')
    } else {
      toast.success('Started cooking!')
      fetchItems(false)
      setActiveTab('PREPARING')
    }
    setActionLoading(false)
  }

  const handleComplete = async (itemId) => {
    setActionLoading(true)
    const { error } = await completeItemAPI(itemId)
    if (error) {
      toast.error('Failed to mark item as ready.')
    } else {
      toast.success('Item marked as ready!')
      fetchItems(false)
    }
    setActionLoading(false)
  }

  const filteredItems = sortItems(
    activeTab === 'READY'
      ? items.filter((item) => item.status === 'READY' || item.status === 'SERVED')
      : items.filter((item) => item.status === activeTab),
    activeTab
  )

  return (
    <div className="p-6">
      {/* Tab bar */}
      <div className="mb-6 flex gap-2">
        {TABS.map((tab) => {
          const count = tab.key === 'READY'
            ? items.filter((i) => i.status === 'READY' || i.status === 'SERVED').length
            : items.filter((i) => i.status === tab.key).length
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  activeTab === tab.key ? 'bg-white/30 text-white' : 'bg-orange-100 text-orange-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <p className="animate-pulse py-8 text-center text-sm font-bold text-orange-400">
          Loading Items...
        </p>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
          <ClipboardList size={48} className="mb-3" />
          <p className="text-sm font-bold">
            {activeTab === 'PENDING' ? 'No items to cook' : activeTab === 'PREPARING' ? 'Nothing cooking right now' : 'No completed items today'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <AssignedItemCard
              key={item.itemId}
              item={item}
              onStart={handleStart}
              onComplete={handleComplete}
              isLoading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  )
}
