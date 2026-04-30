import React from 'react'
import { Calendar, Download, Filter } from 'lucide-react'

/**
 * Header component for the Reports Page.
 * Includes date range pickers and export actions.
 */
export default function ReportsHeader({ dateRange, setDateRange, onExport }) {
  const handleDateChange = (e) => {
    const { name, value } = e.target
    setDateRange(prev => ({ ...prev, [name]: value }))
  }

  const setPreset = (days) => {
    const end = new Date()
    const start = new Date()
    if (days > 0) {
      start.setDate(end.getDate() - (days - 1))
    }
    
    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    })
  }

  const presets = [
    { label: 'Today', days: 1 },
    { label: 'Last 7D', days: 7 },
    { label: 'Last 30D', days: 30 }
  ]

  return (
    <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Monitor your branch performance and business growth
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Presets */}
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setPreset(preset.days)}
              className="rounded-lg px-3 py-1.5 text-xs font-bold transition-all hover:text-gray-900 text-gray-500"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Date Range Selectors */}
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm">
          <div className="flex items-center gap-2 px-2 py-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
            />
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="px-2 py-1">
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <button
          onClick={onExport}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-gray-800 shadow-sm"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
    </div>
  )
}
