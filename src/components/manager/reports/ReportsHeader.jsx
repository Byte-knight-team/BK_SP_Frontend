import React from 'react'
import { Calendar, Download, Filter } from 'lucide-react'

/**
 * Header component for the Reports Page.
 * Includes date range pickers and export actions.
 */
export default function ReportsHeader() {
  return (
    <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Monitor your branch performance and business growth
        </p>
      </div>
    </div>
  )
}
