import React, { useState } from 'react'
import { useAnalyticsData } from '../../hooks/useAnalyticsData'
import ReportsHeader from '../../components/manager/reports/ReportsHeader'
import AnalyticsStats from '../../components/manager/reports/AnalyticsStats'
import RevenueTrendChart from '../../components/manager/reports/RevenueTrendChart'
import ChannelDistributionChart from '../../components/manager/reports/ChannelDistributionChart'
import PeakHoursChart from '../../components/manager/reports/PeakHoursChart'
import TopSellingItemsTable from '../../components/manager/reports/TopSellingItemsTable'
import InventoryHealthChart from '../../components/manager/reports/InventoryHealthChart'
import { AlertCircle, RefreshCw, Loader2, Calendar, FileText, BarChart3 } from 'lucide-react'

/**
 * LoadingSpinner Component
 * Displays a spinning loader while the data is being fetched.
 */
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-brand animate-spin" />
      <p className="text-gray-500 font-medium animate-pulse">Generating reports...</p>
    </div>
  )
}

/**
 * Main Reports & Analytics Page.
 * Orchestrates data fetching and renders analytical components.
 */
export default function ManagerReportsPage() {
  const { data, loading, error, dateRange, setDateRange, refetch } =
    useAnalyticsData()

  const [activeTab, setActiveTab] = useState('analytics')

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

  if (loading && !data) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Failed to load analytics
        </h2>
        <p className="mt-2 text-gray-500">{error}</p>
        <button
          onClick={refetch}
          className="mt-6 flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <ReportsHeader />

      {/* 1. Summary Stats */}
      <AnalyticsStats data={data} />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'analytics'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </button>
          
          <button
            onClick={() => setActiveTab('reports')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reports'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reports
          </button>
        </nav>
      </div>

      {activeTab === 'analytics' ? (
        <div className="space-y-6">
          {/* Date Range Selection (Moved to Analytics Tab, Aligned Left) */}
          <div className="flex flex-wrap items-center justify-start gap-4 mb-2">
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
          </div>

          {/* 2. Charts Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Revenue Trend - Spans 2 columns */}
            <RevenueTrendChart data={data.revenueTrends} />

            {/* Channel Distribution - Spans 1 column */}
            <ChannelDistributionChart data={data.channelDistribution} />

            {/* 3. Peak Hours - Spans 2 columns */}
            <div className="lg:col-span-2">
              <PeakHoursChart data={data.peakHours} />
            </div>

            {/* 4. Top Selling Items - Spans 1 column */}
            <TopSellingItemsTable data={data.topSellingItems} />

            {/* 5. Inventory Health - Spans full width (3 columns) */}
            <InventoryHealthChart data={data.inventoryByCategory} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-24 text-center">
          <FileText className="mb-4 h-12 w-12 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900">Report Generation</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            Advanced report generation options and downloads will be implemented here soon.
          </p>
        </div>
      )}
    </div>
  )
}
