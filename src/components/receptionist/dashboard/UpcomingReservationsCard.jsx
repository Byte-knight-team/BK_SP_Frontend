import { useEffect, useState } from 'react'
import { CalendarDays, Clock, Users, CalendarOff, CalendarClock } from 'lucide-react'
import { getReservationsAPI } from '../../../apis/receptionist/reservations'

const UpcomingReservationsCard = ({ refreshKey = 0 }) => {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReservations = async () => {
      const { data } = await getReservationsAPI()
      if (data) {
        const now = new Date()
        const today = now.toDateString()
        // Only today's upcoming reservations (not tomorrow / future days)
        const upcoming = data
          .filter(r =>
            r.status !== 'CANCELLED' &&
            new Date(r.reservationTime) >= now &&
            new Date(r.reservationTime).toDateString() === today
          )
          .sort((a, b) => new Date(a.reservationTime) - new Date(b.reservationTime))
        setReservations(upcoming)
      }
      setLoading(false)
    }
    fetchReservations()
  }, [refreshKey])

  const formatTime = (dt) => {
    const d = new Date(dt)
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex items-center justify-center rounded-xl bg-purple-50 p-2">
          <CalendarDays size={18} className="text-purple-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-800">Upcoming Reservations</h2>
          <p className="text-xs text-gray-400">{reservations.length} scheduled today</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 py-6 text-gray-300">
          <CalendarOff size={32} strokeWidth={1.2} />
          <p className="text-xs font-medium">No reservations left today</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto min-h-0 pr-1">
          {reservations.map(r => (
            <div key={r.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                <CalendarClock size={16} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{r.customerName}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {formatTime(r.reservationTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {r.guestCount} guests
                  </span>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-black text-purple-600 border border-purple-100">
                {(r.tableNumbers || []).map(n => `T${n}`).join(', ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UpcomingReservationsCard
