import { useState, useEffect } from 'react'
import { X, CalendarDays, Phone, Clock } from 'lucide-react'
import { getReservationsAPI } from '../../../apis/receptionist/reservations'

const ReservationsListModal = ({ isOpen, onClose }) => {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    getReservationsAPI().then(({ data }) => {
      setReservations(data || [])
      setLoading(false)
    })
  }, [isOpen])

  if (!isOpen) return null

  const formatTime = (dt) => {
    if (!dt) return ''
    return new Date(dt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const formatDate = (dt) => {
    if (!dt) return ''
    return new Date(dt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-4xl border border-gray-100 bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100">
              <CalendarDays size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Upcoming Reservations</h2>
              <p className="text-sm text-gray-400">{reservations.length} reservation{reservations.length !== 1 ? 's' : ''} found</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-gray-100">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* List */}
        <div className="max-h-[420px] overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600" />
            </div>
          ) : reservations.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No upcoming reservations</p>
          ) : (
            reservations.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-purple-100 bg-purple-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-xl bg-white px-2.5 py-1 text-[11px] font-black text-purple-700 border border-purple-100">
                        Table {r.tableNumber}
                      </span>
                      <span className="text-xs font-bold text-gray-700">{r.customerName}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={10} /> {formatDate(r.reservationTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {formatTime(r.reservationTime)} – {formatTime(r.endTime)}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`tel:${r.customerPhone}`}
                    className="flex items-center gap-1 rounded-xl bg-white px-2.5 py-1.5 text-[11px] font-bold text-purple-600 border border-purple-100 hover:bg-purple-100 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone size={10} /> {r.customerPhone}
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-2xl border border-gray-200 py-2.5 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default ReservationsListModal
