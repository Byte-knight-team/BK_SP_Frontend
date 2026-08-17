import { X, UserCheck, Phone, Clock } from 'lucide-react'

const fmtTime = (dt) =>
  dt ? new Date(dt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : ''

const fmtDuration = (ms) => {
  const totalMin = Math.round(Math.abs(ms) / 60000)
  if (totalMin < 60) return `${totalMin} min`
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`
}

// Confirmation gate before actually seating a paid reservation — shows the reservation's
// scheduled time and whether it's still upcoming or has already started, so a receptionist
// can't accidentally seat the wrong party or seat one way ahead of its slot without noticing.
const ConfirmSeatingModal = ({ isOpen, onClose, onConfirm, reservation, isLoading }) => {
  if (!isOpen || !reservation) return null

  const resTime = reservation.reservationTime ? new Date(reservation.reservationTime).getTime() : null
  const diffMs = resTime != null ? resTime - Date.now() : null
  const isFuture = diffMs != null && diffMs > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-4xl border border-gray-100 bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div className="rounded-2xl bg-green-100 p-3 text-green-600">
            <UserCheck size={24} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <h3 className="mb-1 text-left text-xl font-bold text-gray-900">Confirm Seating</h3>
        <p className="mb-6 text-left text-sm text-gray-400">
          Seat {reservation.customerName || 'this party'} now?
        </p>

        <div className="mb-5 space-y-2 rounded-2xl bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-800">{reservation.customerName}</p>
          {reservation.customerPhone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone size={12} /> {reservation.customerPhone}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={12} /> {fmtTime(reservation.reservationTime)} – {fmtTime(reservation.endTime)}
          </div>
          {reservation.guestCount != null && (
            <p className="text-xs text-gray-500">Guests: <span className="font-bold text-gray-700">{reservation.guestCount}</span></p>
          )}
        </div>

        {diffMs != null && (
          <div className={`mb-6 rounded-2xl px-4 py-3 text-center text-xs font-bold ${
            isFuture ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {isFuture
              ? `This reservation starts in ${fmtDuration(diffMs)}`
              : `This reservation time started ${fmtDuration(diffMs)} ago`}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl py-4 text-sm font-bold text-gray-400 transition-all hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 rounded-2xl ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'} bg-green-500 py-4 text-sm font-bold text-white shadow-lg shadow-green-200 transition-all hover:bg-green-600 disabled:bg-gray-300 disabled:shadow-none`}
          >
            {isLoading ? 'Seating…' : 'Confirm Seating'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmSeatingModal
