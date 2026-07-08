import { useEffect, useState } from 'react'
import {
  ShoppingBag,
  ChefHat,
  CheckCheck,
  Handshake,
  CreditCard,
  DollarSign,
} from 'lucide-react'
import { getDashboardStatsAPI } from '../../../apis/receptionist/dashboard'

const CARDS = [
  {
    key: 'new',
    title: 'New Orders',
    icon: ShoppingBag,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    qrKey: 'newQR',
    pickupKey: 'newPickup',
  },
  {
    key: 'kitchen',
    title: 'In Kitchen',
    icon: ChefHat,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    qrKey: 'kitchenQR',
    pickupKey: 'kitchenPickup',
  },
  {
    key: 'ready',
    title: 'Ready',
    icon: CheckCheck,
    color: 'text-green-500',
    bg: 'bg-green-50',
    qrKey: 'readyQR',
    pickupKey: 'readyPickup',
  },
  {
    key: 'served',
    title: 'Served',
    icon: Handshake,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    qrKey: 'servedQR',
    pickupKey: 'servedPickup',
  },
  {
    key: 'pendingPayment',
    title: 'Pending Payment',
    icon: CreditCard,
    color: 'text-red-500',
    bg: 'bg-red-50',
    qrKey: 'pendingPaymentQR',
    pickupKey: 'pendingPaymentPickup',
  },
  {
    key: 'collected',
    title: 'Cash Collected',
    icon: DollarSign,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    qrKey: 'collectedTodayQR',
    pickupKey: 'collectedTodayPickup',
    isCurrency: true,
  },
]

function formatValue(val, isCurrency) {
  if (isCurrency) return `Rs ${Number(val || 0).toFixed(2)}`
  return val ?? 0
}

function StatCard({ card, stats, loading }) {
  const Icon = card.icon
  const qrVal = stats?.[card.qrKey]
  const pickupVal = stats?.[card.pickupKey]

  if (loading) {
    return (
      <div className="flex h-32 animate-pulse flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5">
        <div className="h-4 w-28 rounded bg-gray-100" />
        <div className="h-7 w-16 rounded bg-gray-200" />
        <div className="h-3 w-32 rounded bg-gray-100" />
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-gray-500 tracking-wide">{card.title}</p>
        <div className={`flex items-center justify-center rounded-xl p-2.5 ${card.bg}`}>
          <Icon size={20} className={card.color} />
        </div>
      </div>

      {card.isCurrency ? (
        <div className="mt-3">
          <p className="text-2xl font-black text-gray-800">
            {formatValue((qrVal ?? 0) + (pickupVal ?? 0), true)}
          </p>
          <div className="mt-2 flex gap-3 text-xs font-semibold text-gray-400">
            <span>QR: {formatValue(qrVal, true)}</span>
            <span className="text-gray-200">|</span>
            <span>Pickup: {formatValue(pickupVal, true)}</span>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-2xl font-black text-gray-800">
            {(qrVal ?? 0) + (pickupVal ?? 0)}
          </p>
          <div className="mt-2 flex gap-3 text-xs font-semibold text-gray-400">
            <span>QR: {qrVal ?? 0}</span>
            <span className="text-gray-200">|</span>
            <span>Pickup: {pickupVal ?? 0}</span>
          </div>
        </div>
      )}
    </div>
  )
}

const ReceptionistStats = ({ refreshKey = 0 }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await getDashboardStatsAPI()
      if (data) setStats(data)
      setLoading(false)
    }
    fetchStats()
  }, [refreshKey])

  return (
    <>
      {CARDS.map((card) => (
        <StatCard key={card.key} card={card} stats={stats} loading={loading} />
      ))}
    </>
  )
}

export default ReceptionistStats
