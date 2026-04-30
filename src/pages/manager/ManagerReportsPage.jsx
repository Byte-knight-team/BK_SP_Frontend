import React from 'react'
import { useAnalyticsData } from '../../hooks/useAnalyticsData'
import ReportsHeader from '../../components/manager/reports/ReportsHeader'
import AnalyticsStats from '../../components/manager/reports/AnalyticsStats'
import { AlertCircle, RefreshCw } from 'lucide-react'

/**
 * Main Reports & Analytics Page.
 * Orchestrates data fetching and renders analytical components.
 */
export default function ManagerReportsPage() {
  const { data, loading, error, dateRange, setDateRange, refetch } = useAnalyticsData()

  const handleExport = () => {
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-report-${dateRange.startDate}-to-${dateRange.endDate}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-gray-100" />
          <div className="absolute top-0 h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">Analyzing business data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Failed to load analytics</h2>
        <p className="mt-2 text-gray-500">{error}</p>
        <button
          onClick={refetch}
          className="mt-6 flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <ReportsHeader 
        dateRange={dateRange} 
        setDateRange={setDateRange} 
        onExport={handleExport}
      />

      {/* 1. Summary Stats */}
      <AnalyticsStats data={data} />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-6">
        {/* Placeholder for Analytics Widgets (Steps 3.3 - 3.5) */}
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-400">Analytical widgets will be implemented in subsequent steps</p>
            <p className="text-xs text-gray-300 mt-1">Revenue Trends and Channel Distribution coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}
