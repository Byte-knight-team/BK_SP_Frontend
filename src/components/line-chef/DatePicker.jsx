import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { CalendarDays, ChevronDown } from 'lucide-react'
import 'react-day-picker/style.css'

const pad = (n) => String(n).padStart(2, '0')
const toDate = (str) => (str ? new Date(`${str}T00:00:00`) : undefined)
const toStr = (d) => (d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '')
const fmtLabel = (str) =>
  str
    ? new Date(`${str}T00:00:00`).toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

// Calendar date picker (react-day-picker) as a plain drop-down: absolutely positioned below the
// field so it always opens downward — no auto-flip, so it never jumps to the top of the screen.
const DatePicker = ({ value, onChange, disablePast = true, placeholder = 'Pick a date', bordered = false }) => {
  const [open, setOpen] = useState(false)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm outline-none transition-all focus:ring-2 focus:ring-orange-500/20 ${
          bordered ? 'border border-gray-200 bg-white shadow-sm hover:bg-gray-50' : 'bg-gray-50'
        }`}
      >
        <span className={`flex items-center gap-2 ${value ? 'font-medium text-gray-800' : 'text-gray-400'}`}>
          <CalendarDays size={16} className="text-gray-400" />
          {value ? fmtLabel(value) : placeholder}
        </span>
        <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* click-outside backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 flex justify-center rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-300/40">
            <DayPicker
              mode="single"
              selected={toDate(value)}
              onSelect={(d) => {
                if (d) {
                  onChange(toStr(d))
                  setOpen(false)
                }
              }}
              disabled={disablePast ? { before: today } : undefined}
              style={{
                '--rdp-accent-color': '#f97316',
                '--rdp-accent-background-color': '#fff7ed',
                '--rdp-today-color': '#ea580c',
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default DatePicker
