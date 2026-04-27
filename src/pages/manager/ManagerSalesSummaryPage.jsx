import React from 'react'
import SalesSummaryHeader from '../../components/manager/sales/SalesSummaryHeader'
import FinancialStatsGrid from '../../components/manager/sales/FinancialStatsGrid'

const MOCK_DATA = {
  grossSales: 5450,
  netSales: 4450,
  totalRefunds: 2387
}

export default function ManagerSalesSummaryPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SalesSummaryHeader />
      
      <FinancialStatsGrid 
        gross={MOCK_DATA.grossSales}
        net={MOCK_DATA.netSales}
        refunds={MOCK_DATA.totalRefunds}
      />

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-12 text-center">
        <p className="text-gray-400 font-medium italic">Remaining sections coming in next sub-phases...</p>
      </div>
    </div>
  )
}
