import { jsPDF } from 'jspdf'

export const generateBill = (order) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a5' })

  const pageW = doc.internal.pageSize.getWidth()
  const margin = 15
  const contentW = pageW - margin * 2
  let y = 15

  const centerText = (text, fontSize, style = 'normal') => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', style)
    doc.text(text, pageW / 2, y, { align: 'center' })
    y += fontSize * 0.45
  }

  const leftRight = (left, right, fontSize = 9) => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', 'normal')
    doc.text(left, margin, y)
    doc.text(right, pageW - margin, y, { align: 'right' })
    y += 5.5
  }

  const divider = () => {
    y += 2
    doc.setDrawColor(200)
    doc.line(margin, y, pageW - margin, y)
    y += 4
  }

  // ── Header ──
  centerText('CRAVE HOUSE', 16, 'bold')
  y += 1
  centerText('Restaurant Receipt', 9)
  y += 3
  divider()

  // ── Order Info ──
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('ORDER DETAILS', margin, y)
  y += 5.5

  leftRight('Order Number:', `#${order.orderNumber}`)
  leftRight('Date:', order.placedAt || '—')
  leftRight('Type:', order.orderType === 'QR'
    ? 'QR Dine-in'
    : order.orderType === 'ONLINE_DELIVERY'
    ? 'Home Delivery'
    : 'Online Pickup')
  leftRight('Status:', order.status.replace('_', ' '))

  if (order.orderType === 'QR' && order.tableNumber) {
    leftRight('Table:', `#${order.tableNumber}`)
  }

  divider()

  // ── Customer ──
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('CUSTOMER', margin, y)
  y += 5.5

  const customerName = order.contactName || order.customerName || 'Guest'
  const customerPhone = order.contactPhone || order.customerPhone || '—'
  const customerEmail = order.contactEmail || order.customerEmail || '—'

  leftRight('Name:', customerName)
  leftRight('Phone:', customerPhone)
  leftRight('Email:', customerEmail)

  divider()

  // ── Items ──
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('ITEMS', margin, y)
  y += 5.5

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('Item', margin, y)
  doc.text('Qty', margin + contentW * 0.6, y, { align: 'center' })
  doc.text('Subtotal', pageW - margin, y, { align: 'right' })
  y += 4.5

  doc.setFont('helvetica', 'normal')
  order.items.forEach((item) => {
    doc.setFontSize(9)
    const nameLines = doc.splitTextToSize(item.itemName, contentW * 0.58)
    doc.text(nameLines, margin, y)
    doc.text(String(item.quantity), margin + contentW * 0.6, y, { align: 'center' })
    doc.text(`Rs. ${item.subtotal.toFixed(2)}`, pageW - margin, y, { align: 'right' })
    y += nameLines.length * 5

    if (item.kitchenNotes) {
      doc.setFontSize(7.5)
      doc.setTextColor(180, 100, 0)
      doc.text(`Note: ${item.kitchenNotes}`, margin + 2, y)
      doc.setTextColor(0)
      y += 4.5
    }
  })

  divider()

  // ── Payment Summary ──
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('PAYMENT SUMMARY', margin, y)
  y += 5.5

  doc.setFont('helvetica', 'normal')
  leftRight('Subtotal:', `Rs. ${order.totalAmount.toFixed(2)}`)

  if (order.taxAmount > 0)
    leftRight('Tax:', `Rs. ${order.taxAmount.toFixed(2)}`)

  if (order.serviceCharge > 0)
    leftRight('Service Charge:', `Rs. ${order.serviceCharge.toFixed(2)}`)

  if (order.discountAmount > 0) {
    const couponLabel = order.appliedCouponCode
      ? `Discount (${order.appliedCouponCode}):`
      : 'Discount:'
    leftRight(couponLabel, `- Rs. ${order.discountAmount.toFixed(2)}`)
  }

  y += 1
  doc.setDrawColor(200)
  doc.line(margin, y, pageW - margin, y)
  y += 4

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  const totalLabel = order.status === 'CANCELLED' ? 'Total (Cancelled):' : 'TOTAL:'
  leftRight(totalLabel, `Rs. ${order.finalAmount.toFixed(2)}`, 10)

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  const paymentText = order.status === 'CANCELLED'
    ? '— Cancelled'
    : order.paymentStatus === 'PENDING'
    ? 'Cash — Not Yet Collected'
    : '✓ Paid'
  leftRight('Payment:', paymentText)

  divider()

  // ── Footer ──
  centerText('Thank you for choosing Crave House!', 8)
  y += 1
  centerText('Please visit us again.', 8)

  doc.save(`receipt-${order.orderNumber}.pdf`)
}
