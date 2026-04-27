import React from 'react'
import SalesSummaryHeader from '../../components/manager/sales/SalesSummaryHeader'
import FinancialStatsGrid from '../../components/manager/sales/FinancialStatsGrid'
import TransactionLogTable from '../../components/manager/sales/TransactionLogTable'
import PaymentMethodsBreakdown from '../../components/manager/sales/PaymentMethodsBreakdown'

const MOCK_DATA = {
  grossSales: 5450,
  netSales: 4450,
  totalRefunds: 2387,
  cardPayments: 3825,
  cashPayments: 1625,
  dineInOrders: 2100,
  deliveryOrders: 3350,
  transactions: [
    { id: 'TRX-9823', date: 'Today, 10:42 AM', customer: 'Alex Johnson', mode: 'Credit Card', amount: 45.50, status: 'Completed' },
    { id: 'TRX-9822', date: 'Today, 10:38 AM', customer: 'Maria Garcia', mode: 'Online Payment', amount: 128.20, status: 'Completed' },
    { id: 'TRX-9821', date: 'Today, 10:15 AM', customer: 'Sam Wilson', mode: 'Cash', amount: 32.00, status: 'Completed' },
    { id: 'TRX-9820', date: 'Today, 09:55 AM', customer: 'Table 4 (Walk-in)', mode: 'Credit Card', amount: 85.90, status: 'Completed' },
    { id: 'TRX-9819', date: 'Today, 09:42 AM', customer: 'Jessica Brown', mode: 'Online Payment', amount: 24.50, status: 'Refunded' },
    { id: 'TRX-9818', date: 'Yesterday, 08:15 PM', customer: 'Michael Scott', mode: 'Cash', amount: 210.00, status: 'Completed' },
    { id: 'TRX-9817', date: 'Yesterday, 07:30 PM', customer: 'Jim Halpert', mode: 'Credit Card', amount: 55.25, status: 'Completed' },
    { id: 'TRX-9816', date: 'Yesterday, 06:45 PM', customer: 'Dwight Schrute', mode: 'Cash', amount: 42.00, status: 'Completed' },
  ]
}

export default function ManagerSalesSummaryPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <SalesSummaryHeader />
      
      <FinancialStatsGrid 
        gross={MOCK_DATA.grossSales}
        net={MOCK_DATA.netSales}
        refunds={MOCK_DATA.totalRefunds}
      />

      <TransactionLogTable 
        transactions={MOCK_DATA.transactions}
      />

      <PaymentMethodsBreakdown 
        cardTotal={MOCK_DATA.cardPayments}
        cashTotal={MOCK_DATA.cashPayments}
        dineIn={MOCK_DATA.dineInOrders}
        delivery={MOCK_DATA.deliveryOrders}
      />
    </div>
  )
}
