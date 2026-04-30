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

  return (
    <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your branch performance and business growth
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range Selectors */}
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm">
          <div className="flex items-center gap-2 px-2 py-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="bg-transparent text-sm font-medium text-gray-700 outline-none"
            />
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="px-2 py-1">
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="bg-transparent text-sm font-medium text-gray-700 outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <button
          onClick={onExport}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800"
        >
          <Download className="h-4 w-4" />
          Export JSON
        </button>
      </div>
    </div>
  )
}
