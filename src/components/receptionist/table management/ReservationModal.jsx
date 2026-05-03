import { useState } from 'react'
import { X, CheckCircle, Loader2 } from 'lucide-react'
import { createReservationAPI } from '../../../apis/receptionist/tables'
import { toast } from 'react-toastify'

const ReservationModal = ({ isOpen, onClose, tables, onSave }) => {
  // State to hold all form inputs (and initialize the form data)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    reservationDate: '',
    reservationTime: '',
    guestCount: 1,
    tableId: '',
  })

  // State to handle the loading animation during the API call
  const [loading, setLoading] = useState(false)

  // This function runs when the "Confirm Booking" button is clicked
  const handleSubmit = async (e) => {
    e.preventDefault() // Prevent the page from refreshing
    setLoading(true) //show the spinner in the button when api is processing

    /**
     * 1. Format Date & Time for Backend
     * Backend expects LocalDateTime: "YYYY-MM-DDTHH:mm:ss"
     * We combine the date ("2023-10-12") + "T" + time ("14:30") + ":00"
     */
    const formattedDateTime = `${formData.reservationDate}T${formData.reservationTime}:00`

    // Prepare the data object to send to the backend
    const payload = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      reservationTime: formattedDateTime,
      guestCount: parseInt(formData.guestCount),
      tableId: parseInt(formData.tableId),
    }

    // Call the API and wait for the response
    const { data, error } = await createReservationAPI(payload)

    if (error) {
      toast.error(error)
    } else {
      toast.success('Reservation created successfully!')
      onSave() // This tells the parent page to refresh the table list
      onClose() // Close the modal
    }
    setLoading(false) // Stop the loading spinner
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-4xl bg-white p-8 shadow-2xl">
        {/* Header Section */}
        <div className="mb-8 flex items-start justify-between">
          {/* Title & Description */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900">
              New Reservation
            </h3>
            <p className="mt-1 text-sm font-medium text-gray-400">
              Please fill in the details below to book a table.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="ml-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* The Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Customer Name Input */}
            <div className="col-span-2">
              <label className="mb-2 block text-xs font-bold tracking-widest text-gray-400 uppercase">
                Customer Name
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Kamal Perera"
                className="w-full rounded-2xl border-none bg-gray-50 p-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
              />
            </div>

            {/* Phone Number Input */}
            <div className="col-span-2">
              <label className="mb-2 block text-xs font-bold tracking-widest text-gray-400 uppercase">
                Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="+94 77 123 4567"
                className="w-full rounded-2xl border-none bg-gray-50 p-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
              />
            </div>

            {/* Date Picker */}
            <div className="col-span-1">
              <label className="mb-2 block text-xs font-bold tracking-widest text-gray-400 uppercase">
                Date
              </label>
              <input
                type="date"
                required
                className="w-full rounded-2xl border-none bg-gray-50 p-4 text-sm font-bold text-gray-700 outline-none"
                value={formData.reservationDate}
                onChange={(e) =>
                  setFormData({ ...formData, reservationDate: e.target.value })
                }
              />
            </div>

            {/* Time Picker */}
            <div className="col-span-1">
              <label className="mb-2 block text-xs font-bold tracking-widest text-gray-400 uppercase">
                Time
              </label>
              <input
                type="time"
                required
                className="w-full rounded-2xl border-none bg-gray-50 p-4 text-sm font-bold text-gray-700 outline-none"
                value={formData.reservationTime}
                onChange={(e) =>
                  setFormData({ ...formData, reservationTime: e.target.value })
                }
              />
            </div>

            {/* Guest Count */}
            <div className="col-span-1">
              <label className="mb-2 block text-xs font-bold tracking-widest text-gray-400 uppercase">
                Guests
              </label>
              <input
                type="number"
                min="1"
                required
                className="w-full rounded-2xl border-none bg-gray-50 p-4 text-sm font-bold text-gray-700 outline-none"
                value={formData.guestCount}
                onChange={(e) =>
                  setFormData({ ...formData, guestCount: e.target.value })
                }
              />
            </div>

            {/* Table Selection Dropdown */}
            <div className="col-span-1">
              <label className="mb-2 block text-xs font-bold tracking-widest text-gray-400 uppercase">
                Assign Table
              </label>
              <select
                required
                className="w-full rounded-2xl border-none bg-gray-50 p-4 text-sm font-bold text-gray-700 outline-none"
                value={formData.tableId}
                onChange={(e) =>
                  setFormData({ ...formData, tableId: e.target.value })
                }
              >
                <option value="">Select Table</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    Table {t.tableNumber} ({t.capacity} Seats)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button with Loading State */}
          <button
            type="submit"
            disabled={loading} // Disable button while loading
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" /> // Spinner shows if loading
            ) : (
              <CheckCircle size={18} /> // Check icon shows if not loading
            )}
            {loading ? 'PROCESSING...' : 'CONFIRM BOOKING'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ReservationModal
