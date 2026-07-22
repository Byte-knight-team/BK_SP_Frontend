import React, { useState } from 'react'
import { Download, Calendar, Loader2 } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import toast from 'react-hot-toast'

export default function ReportCard({ 
  title, 
  description, 
  icon: Icon, 
  onDownload, 
  hasDateFilter = true,
  defaultDateRange = null
}) {
  const { user } = useAuth()
  const branchId = user?.branchId
  const userId = user?.id

  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState(defaultDateRange || {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setDateRange((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDownload = async () => {
    if (!branchId || !userId) {
      toast.error('User information not fully loaded.')
      return
    }

    try {
      setLoading(true)
      await onDownload(
        branchId, 
        userId, 
        hasDateFilter ? dateRange.startDate : null, 
        hasDateFilter ? dateRange.endDate : null
      )
      toast.success(`${title} downloaded successfully!`)
    } catch (error) {
      console.error(`Failed to download ${title}:`, error)
      toast.error(`Failed to download ${title}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-brand/30 hover:shadow-md">
      
      {/* Header section */}
      <div>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
        <p className="mb-6 text-sm text-gray-500 leading-relaxed min-h-[40px]">{description}</p>
      </div>

      {/* Footer / Controls Section */}
      <div className="space-y-4 border-t border-gray-100 pt-4">
        {hasDateFilter ? (
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1.5 shadow-inner">
            <div className="flex flex-1 items-center gap-2 px-2 py-1">
              <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="w-full cursor-pointer bg-transparent text-xs font-bold text-gray-700 outline-none"
                title="Start Date"
              />
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex flex-1 items-center px-2 py-1">
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="w-full cursor-pointer bg-transparent text-xs font-bold text-gray-700 outline-none"
                title="End Date"
              />
            </div>
          </div>
        ) : (
          <div className="flex h-[42px] items-center rounded-xl border border-transparent bg-gray-50 px-3 text-xs text-gray-500 italic">
            * This report is a current snapshot (no date filter).
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PDF
            </>
          )}
        </button>
      </div>
    </div>
  )
}
