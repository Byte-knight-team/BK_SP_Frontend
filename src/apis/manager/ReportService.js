import { authFetch } from '../apiHelper'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"

/**
 * Service for fetching Manager Reports as downloadable PDFs.
 */
export const ReportService = {

  // Helper method to download a PDF blob
  _downloadBlob: async (response, defaultFilename) => {
    const blob = await response.blob()
    
    // Try to get filename from Content-Disposition header if possible
    let filename = defaultFilename
    const disposition = response.headers.get('Content-Disposition')
    if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        const matches = filenameRegex.exec(disposition)
        if (matches != null && matches[1]) { 
            filename = matches[1].replace(/['"]/g, '')
        }
    }

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    
    // Cleanup
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },

  downloadSalesReport: async (branchId, userId, startDate, endDate) => {
    let url = `${BASE_URL}/api/manager/reports/sales?branchId=${branchId}&userId=${userId}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    
    const response = await authFetch(url)
    await ReportService._downloadBlob(response, 'sales-report.pdf')
  },

  downloadRevenueTrendReport: async (branchId, userId, startDate, endDate) => {
    let url = `${BASE_URL}/api/manager/reports/revenue-trend?branchId=${branchId}&userId=${userId}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    
    const response = await authFetch(url)
    await ReportService._downloadBlob(response, 'revenue-trend.pdf')
  },

  downloadTopSellingItemsReport: async (branchId, userId, startDate, endDate) => {
    let url = `${BASE_URL}/api/manager/reports/top-selling-items?branchId=${branchId}&userId=${userId}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    
    const response = await authFetch(url)
    await ReportService._downloadBlob(response, 'top-selling-items.pdf')
  },

  downloadOrderSummaryReport: async (branchId, userId, startDate, endDate) => {
    let url = `${BASE_URL}/api/manager/reports/order-summary?branchId=${branchId}&userId=${userId}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    
    const response = await authFetch(url)
    await ReportService._downloadBlob(response, 'order-summary.pdf')
  },

  downloadDeliveryPerformanceReport: async (branchId, userId, startDate, endDate) => {
    let url = `${BASE_URL}/api/manager/reports/delivery-performance?branchId=${branchId}&userId=${userId}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    
    const response = await authFetch(url)
    await ReportService._downloadBlob(response, 'delivery-performance.pdf')
  },

  downloadReservationReport: async (branchId, userId, startDate, endDate) => {
    let url = `${BASE_URL}/api/manager/reports/reservations?branchId=${branchId}&userId=${userId}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    
    const response = await authFetch(url)
    await ReportService._downloadBlob(response, 'reservation-report.pdf')
  },

  downloadInventoryStatusReport: async (branchId, userId, startDate, endDate) => {
    let url = `${BASE_URL}/api/manager/reports/inventory-status?branchId=${branchId}&userId=${userId}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`

    const response = await authFetch(url)
    await ReportService._downloadBlob(response, 'inventory-status.pdf')
  },

  downloadProcurementReport: async (branchId, userId, startDate, endDate) => {
    let url = `${BASE_URL}/api/manager/reports/procurement?branchId=${branchId}&userId=${userId}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    
    const response = await authFetch(url)
    await ReportService._downloadBlob(response, 'procurement-report.pdf')
  },

  downloadStaffDetailsReport: async (branchId, userId) => {
    let url = `${BASE_URL}/api/manager/reports/staff-details?branchId=${branchId}&userId=${userId}`
    
    const response = await authFetch(url)
    await ReportService._downloadBlob(response, 'staff-details.pdf')
  },

  downloadCustomerReviewsReport: async (branchId, userId, startDate, endDate) => {
    let url = `${BASE_URL}/api/manager/reports/customer-reviews?branchId=${branchId}&userId=${userId}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    
    const response = await authFetch(url)
    await ReportService._downloadBlob(response, 'customer-reviews.pdf')
  }
}
