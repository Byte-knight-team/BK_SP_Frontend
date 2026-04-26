import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ManagerSidebar from './components/manager/ManagerSidebar'
import ManagerHeader from './components/manager/ManagerHeader'
import ManagerDashboardPage from './pages/manager/ManagerDashboardPage'
import ManagerInventoryPage from './pages/manager/ManagerInventoryPage'
import ManagerDriversPage from './pages/manager/ManagerDriversPage'

const router = createBrowserRouter([
  {
    path: '/manager',
    element: (
      <MainLayout
        Sidebar={ManagerSidebar}
        Header={ManagerHeader}
      />
    ),
    children: [
      { index: true,       element: <ManagerDashboardPage /> },
      { path: 'inventory', element: <ManagerInventoryPage /> },
      { path: 'drivers',   element: <ManagerDriversPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
