import { useState } from 'react'
import { X, CalendarCheck } from 'lucide-react'
import { toast } from 'react-toastify'
import { createReservationAPI } from '../../../apis/receptionist/reservations'

const ReservationModal = ({ isOpen, onClose, tables, onSuccess }) => {
  const [form, setForm] = useState({
    tableId: '',
    customerName: '',
    customerPhone: '',
    reservationTime: '',
    endTime: '',
    guestCount: '',
  })
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleClose = () => {
    setForm({ tableId: '', customerName: '', customerPhone: '', reservationTime: '', endTime: '', guestCount: '' })
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (new Date(form.endTime) <= new Date(form.reservationTime)) {
      toast.error('Leave time must be after arrive time')
      return
    }
    setLoading(true)
    const { data, error } = await createReservationAPI({
      tableId: Number(form.tableId),
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      reservationTime: form.reservationTime,
      endTime: form.endTime,
      guestCount: Number(form.guestCount),
    })
    setLoading(false)
    if (error) {
      toast.error(error)
      return
    }
    toast.success(`Reservation created for ${data.customerName}`)
    onSuccess?.()
    handleClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-4xl border border-gray-100 bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100">
              <CalendarCheck size={20} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">New Reservation</h2>
              <p className="text-sm text-gray-400">Book a table for a guest</p>
            </div>
          </div>
          <button onClick={handleClose} className="rounded-xl p-2 transition-colors hover:bg-gray-100">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            placeholder="Customer name"
            required
            className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-orange-500/20"
          />

          <input
            name="customerPhone"
            value={form.customerPhone}
            onChange={handleChange}
            placeholder="Phone number"
            required
            className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-orange-500/20"
          />

          <select
            name="tableId"
            value={form.tableId}
            onChange={handleChange}
            required
            className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="">Select table</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                Table {t.tableNumber} — capacity {t.capacity}
              </option>
            ))}
          </select>

          <div>
            <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-gray-400">
              Arrive time
            </label>
            <input
              type="datetime-local"
              name="reservationTime"
              value={form.reservationTime}
              onChange={handleChange}
              required
              className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-gray-400">
              Leave time
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
              className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <input
            type="number"
            name="guestCount"
            value={form.guestCount}
            onChange={handleChange}
            placeholder="Guest count"
            min={1}
            required
            className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-orange-500/20"
          />

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-2xl border border-gray-200 py-2.5 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-orange-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-colors disabled:bg-gray-300 disabled:shadow-none"
            >
              {loading ? 'Saving...' : 'Reserve'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReservationModal
