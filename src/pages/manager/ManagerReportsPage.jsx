import React from 'react'
import { useAnalyticsData } from '../../hooks/useAnalyticsData'
import ReportsHeader from '../../components/manager/reports/ReportsHeader'
import AnalyticsStats from '../../components/manager/reports/AnalyticsStats'
import RevenueTrendChart from '../../components/manager/reports/RevenueTrendChart'
import ChannelDistributionChart from '../../components/manager/reports/ChannelDistributionChart'
import PeakHoursChart from '../../components/manager/reports/PeakHoursChart'
import TopSellingItemsTable from '../../components/manager/reports/TopSellingItemsTable'
import InventoryHealthChart from '../../components/manager/reports/InventoryHealthChart'
import ReportsSkeleton from '../../components/manager/reports/ReportsSkeleton'
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
    return <ReportsSkeleton />
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
  )
}
