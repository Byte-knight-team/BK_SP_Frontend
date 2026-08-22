import React, { useState } from 'react'
import { useAnalyticsData } from '../../hooks/useAnalyticsData'
import ReportsHeader from '../../components/manager/reports/ReportsHeader'
import AnalyticsStats from '../../components/manager/reports/AnalyticsStats'
import RevenueTrendChart from '../../components/manager/reports/RevenueTrendChart'
import ChannelDistributionChart from '../../components/manager/reports/ChannelDistributionChart'
import PeakHoursChart from '../../components/manager/reports/PeakHoursChart'
import TopSellingItemsTable from '../../components/manager/reports/TopSellingItemsTable'
import InventoryHealthChart from '../../components/manager/reports/InventoryHealthChart'
import {
  AlertCircle,
  RefreshCw,
  Loader2,
  Calendar,
  FileText,
  BarChart3,
  CircleDollarSign,
  TrendingUp,
  Star,
  ShoppingBag,
  Truck,
  CalendarDays,
  Package,
  ShoppingCart,
  Users,
  MessageSquare
} from 'lucide-react'
import ReportCard from '../../components/manager/reports/ReportCard'
import { ReportService } from '../../apis/manager/ReportService'

/**
 * LoadingSpinner Component
 * Displays a spinning loader while the data is being fetched.
 */
function LoadingSpinner() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="text-brand h-10 w-10 animate-spin" />
      <p className="animate-pulse font-medium text-gray-500">
        Generating reports...
      </p>
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
    setDateRange((prev) => ({ ...prev, [name]: value }))
  }

  const setPreset = (days) => {
    const end = new Date()
    const start = new Date()
    if (days > 0) {
      start.setDate(end.getDate() - (days - 1))
    }

    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    })
  }

  const presets = [
    { label: 'Today', days: 1 },
    { label: 'Last 7D', days: 7 },
    { label: 'Last 30D', days: 30 },
  ]

  const getActivePreset = () => {
    const today = new Date();
    const endDateStr = today.toISOString().split('T')[0];
    
    if (dateRange.endDate !== endDateStr) return null;

    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays === 1) return 'Today';
    if (diffDays === 7) return 'Last 7D';
    if (diffDays === 30) return 'Last 30D';
    return null;
  }
  
  const activePreset = getActivePreset();

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
    <div className="animate-in fade-in slide-in-from-bottom-2 mx-auto max-w-7xl space-y-8 pb-12 duration-500">
      <ReportsHeader />

      {/* 1. Summary Stats */}
      <AnalyticsStats data={data} />

      {/* Tab Navigation and Filters */}
      <div className="flex min-h-15 flex-col justify-between gap-4 border-b border-gray-200 sm:flex-row sm:items-end">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'analytics'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Analytics
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'reports'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Reports
          </button>
        </nav>

        <div className="flex min-h-11.5 flex-wrap items-center gap-4 pb-3 sm:pb-3">
          {activeTab === 'analytics' && (
            <>
              <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setPreset(preset.days)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      activePreset === preset.label
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
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
                    max={dateRange.endDate}
                    onChange={handleDateChange}
                    className="cursor-pointer bg-transparent text-sm font-bold text-gray-700 outline-none"
                  />
                </div>
                <div className="h-4 w-px bg-gray-200" />
                <div className="px-2 py-1">
                  <input
                    type="date"
                    name="endDate"
                    value={dateRange.endDate}
                    min={dateRange.startDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={handleDateChange}
                    className="cursor-pointer bg-transparent text-sm font-bold text-gray-700 outline-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <div className="space-y-6">
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ReportCard
            title="Sales Report"
            description="Comprehensive breakdown of gross sales, refunds, net sales, taxes, and payment methods."
            icon={CircleDollarSign}
            onDownload={ReportService.downloadSalesReport}
            hasDateFilter={true}
            defaultDateRange={dateRange}
          />
          <ReportCard
            title="Revenue Trend"
            description="Daily revenue analysis, order volumes, and average order values over time."
            icon={TrendingUp}
            onDownload={ReportService.downloadRevenueTrendReport}
            hasDateFilter={true}
            defaultDateRange={dateRange}
          />
          <ReportCard
            title="Top Selling Items"
            description="Ranked list of menu items by quantity sold and total revenue generated."
            icon={Star}
            onDownload={ReportService.downloadTopSellingItemsReport}
            hasDateFilter={true}
            defaultDateRange={dateRange}
          />
          <ReportCard
            title="Order Summary"
            description="Insights on order statuses, cancellation reasons, and peak ordering hours."
            icon={ShoppingBag}
            onDownload={ReportService.downloadOrderSummaryReport}
            hasDateFilter={true}
            defaultDateRange={dateRange}
          />
          <ReportCard
            title="Delivery Performance"
            description="Driver statistics, average delivery times, and cancellation rates."
            icon={Truck}
            onDownload={ReportService.downloadDeliveryPerformanceReport}
            hasDateFilter={true}
            defaultDateRange={dateRange}
          />
          <ReportCard
            title="Reservations"
            description="Daily reservation volumes, status breakdowns, and deposit revenue."
            icon={CalendarDays}
            onDownload={ReportService.downloadReservationReport}
            hasDateFilter={true}
            defaultDateRange={dateRange}
          />
          <ReportCard
            title="Inventory Status"
            description="Current stock levels, low stock alerts, and inventory transaction history."
            icon={Package}
            onDownload={ReportService.downloadInventoryStatusReport}
            hasDateFilter={true}
            defaultDateRange={dateRange}
          />
          <ReportCard
            title="Procurement & POs"
            description="Purchase order statuses, vendor spend analysis, and GRN summaries."
            icon={ShoppingCart}
            onDownload={ReportService.downloadProcurementReport}
            hasDateFilter={true}
            defaultDateRange={dateRange}
          />
          <ReportCard
            title="Staff Details"
            description="Current directory of all staff members, roles, and employment status."
            icon={Users}
            onDownload={ReportService.downloadStaffDetailsReport}
            hasDateFilter={false}
          />
          <ReportCard
            title="Customer Reviews"
            description="Rating distributions and a summary of recent customer feedback."
            icon={MessageSquare}
            onDownload={ReportService.downloadCustomerReviewsReport}
            hasDateFilter={true}
            defaultDateRange={dateRange}
          />
        </div>
      )}
    </div>
  )
}
