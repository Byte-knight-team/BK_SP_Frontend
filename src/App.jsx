import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import DashboardPage from './pages/DashboardPage'
import StaffPage from './pages/StaffPage'
import InventoryPage from './pages/InventoryPage'
import SalesSummaryPage from './pages/SalesSummaryPage'
import StockAlertsPage from './pages/StockAlertsPage'
import DriversPage from './pages/DriversPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'staff', element: <StaffPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'sales', element: <SalesSummaryPage /> },
      { path: 'stock-alerts', element: <StockAlertsPage /> },
      { path: 'drivers', element: <DriversPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
