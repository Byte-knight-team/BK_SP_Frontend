import { jsPDF } from 'jspdf'

export const generateBill = (order) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const margin = 18
  const contentW = pageW - margin * 2
  let y = 0

  const orange = [234, 88, 12]
  const lightGray = [245, 245, 245]
  const midGray = [200, 200, 200]
  const darkText = [30, 30, 30]

  // ── Orange header bar ──
  doc.setFillColor(...orange)
  doc.rect(0, 0, pageW, 38, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('CRAVE HOUSE', margin, 16)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Restaurant Receipt', margin, 23)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`#${order.orderNumber}`, pageW - margin, 14, { align: 'right' })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('RECEIPT NUMBER', pageW - margin, 20, { align: 'right' })

  const orderType =
    order.orderType === 'QR'
      ? 'QR Dine-in'
      : order.orderType === 'ONLINE_DELIVERY'
      ? 'Home Delivery'
      : 'Online Pickup'

  doc.text(orderType.toUpperCase(), pageW - margin, 30, { align: 'right' })

  y = 48

  // ── Date / Status row ──
  doc.setTextColor(...darkText)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`Date: ${order.placedAt || '—'}`, margin, y)

  const statusLabel = order.status?.replace(/_/g, ' ') || '—'
  doc.setFont('helvetica', 'bold')
  doc.text(`Status: ${statusLabel}`, pageW - margin, y, { align: 'right' })

  if (order.orderType === 'QR' && order.tableNumber) {
    y += 5.5
    doc.setFont('helvetica', 'normal')
    doc.text(`Table: #${order.tableNumber}`, margin, y)
  }

  y += 8

  // ── Light gray divider ──
  doc.setDrawColor(...midGray)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  // ── BILL TO ──
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...orange)
  doc.text('BILL TO', margin, y)
  y += 5.5

  doc.setTextColor(...darkText)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  const customerName = order.contactName || order.customerName || 'Guest'
  doc.text(customerName, margin, y)
  y += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  const customerPhone = order.contactPhone || order.customerPhone || '—'
  const customerEmail = order.contactEmail || order.customerEmail || '—'
  doc.text(customerPhone, margin, y)
  y += 4.5
  doc.text(customerEmail, margin, y)
  y += 10

  // ── Items table header ──
  doc.setFillColor(...lightGray)
  doc.rect(margin, y - 1, contentW, 8, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkText)
  doc.text('ITEM', margin + 2, y + 4)
  doc.text('QTY', margin + contentW * 0.62, y + 4, { align: 'center' })
  doc.text('UNIT PRICE', margin + contentW * 0.78, y + 4, { align: 'center' })
  doc.text('SUBTOTAL', pageW - margin - 2, y + 4, { align: 'right' })
  y += 10

  // ── Items ──
  doc.setFont('helvetica', 'normal')
  order.items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(251, 251, 251)
      doc.rect(margin, y - 4, contentW, 8, 'F')
    }

    doc.setFontSize(8.5)
    doc.setTextColor(...darkText)
    const nameLines = doc.splitTextToSize(item.itemName, contentW * 0.58)
    doc.text(nameLines, margin + 2, y)
    doc.text(String(item.quantity), margin + contentW * 0.62, y, { align: 'center' })

    const unitPrice = item.subtotal / item.quantity
    doc.text(`Rs. ${unitPrice.toFixed(2)}`, margin + contentW * 0.78, y, { align: 'center' })
    doc.text(`Rs. ${item.subtotal.toFixed(2)}`, pageW - margin - 2, y, { align: 'right' })

    y += nameLines.length * 5

    if (item.kitchenNotes) {
      doc.setFontSize(7.5)
      doc.setTextColor(180, 100, 0)
      doc.text(`  Note: ${item.kitchenNotes}`, margin + 2, y)
      doc.setTextColor(...darkText)
      y += 4.5
    }

    y += 2
  })

  y += 4
  doc.setDrawColor(...midGray)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  // ── Payment summary ──
  const summaryX = margin + contentW * 0.55

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkText)

  const summaryRow = (label, value, bold = false) => {
    if (bold) doc.setFont('helvetica', 'bold')
    else doc.setFont('helvetica', 'normal')
    doc.text(label, summaryX, y)
    doc.text(value, pageW - margin, y, { align: 'right' })
    y += 6
  }

  summaryRow('Subtotal:', `Rs. ${order.totalAmount.toFixed(2)}`)

  if (order.taxAmount > 0)
    summaryRow('Tax:', `Rs. ${order.taxAmount.toFixed(2)}`)

  if (order.serviceCharge > 0)
    summaryRow('Service Charge:', `Rs. ${order.serviceCharge.toFixed(2)}`)

  if (order.discountAmount > 0) {
    const couponLabel = order.appliedCouponCode
      ? `Discount (${order.appliedCouponCode}):`
      : 'Discount:'
    summaryRow(couponLabel, `- Rs. ${order.discountAmount.toFixed(2)}`)
  }

  y += 2
  doc.setFillColor(...orange)
  doc.rect(summaryX - 2, y - 1, pageW - margin - summaryX + 2, 10, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  const totalLabel = order.status === 'CANCELLED' ? 'Total (Cancelled):' : 'TOTAL:'
  doc.text(totalLabel, summaryX + 1, y + 6)
  doc.text(`Rs. ${order.finalAmount.toFixed(2)}`, pageW - margin - 1, y + 6, { align: 'right' })

  y += 16

  doc.setTextColor(...darkText)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  const paymentText =
    order.status === 'CANCELLED'
      ? 'Cancelled'
      : order.paymentStatus === 'PENDING'
      ? 'Cash — Not Yet Collected'
      : 'Paid'
  doc.text('Payment Method:', summaryX, y)
  doc.setFont('helvetica', 'bold')
  doc.text(paymentText, pageW - margin, y, { align: 'right' })

  y += 16

  // ── Footer ──
  doc.setDrawColor(...midGray)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...orange)
  doc.text('Thank you for choosing Crave House!', pageW / 2, y, { align: 'center' })
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text('Please visit us again.', pageW / 2, y, { align: 'center' })

  doc.save(`receipt-${order.orderNumber}.pdf`)
}
