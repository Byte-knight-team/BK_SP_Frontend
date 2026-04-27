import React from 'react'
import SalesSummaryHeader from '../../components/manager/sales/SalesSummaryHeader'
import FinancialStatsGrid from '../../components/manager/sales/FinancialStatsGrid'
import TransactionLogTable from '../../components/manager/sales/TransactionLogTable'
import PaymentMethodsBreakdown from '../../components/manager/sales/PaymentMethodsBreakdown'
import { useSalesData } from '../../hooks/useSalesData'
import { Loader2, AlertCircle, RefreshCcw } from 'lucide-react'

export default function ManagerSalesSummaryPage() {
  const { data, loading, error, refetch } = useSalesData()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Gathering financial records...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center max-w-md mx-auto">
        <div className="p-4 bg-red-50 rounded-full">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Connection Error</h3>
          <p className="text-gray-500">{error}</p>
        </div>
        <button 
          onClick={refetch}
          className="flex items-center gap-2 bg-brand text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-brand/20 hover:scale-105 transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SalesSummaryHeader />
      
      <FinancialStatsGrid 
        gross={data?.grossSales || 0}
        net={data?.netSales || 0}
        refunds={data?.totalRefunds || 0}
      />

      <TransactionLogTable 
        transactions={data?.transactions || []}
      />

      <PaymentMethodsBreakdown 
        cardTotal={data?.cardPayments || 0}
        cashTotal={data?.cashPayments || 0}
        dineIn={data?.dineInOrders || 0}
        delivery={data?.deliveryOrders || 0}
      />
    </div>
  )
}
