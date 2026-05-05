import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { CartProvider } from './context/CartContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css';

// Layouts
import MainLayout from './layouts/MainLayout'

// Role layout components
import SuperAdminSidebar from './components/superadmin/SuperAdminSidebar'
import SuperAdminHeader from './components/superadmin/SuperAdminHeader'

import AdminSidebar from './components/admin/AdminSidebar'
import AdminHeader from './components/admin/AdminHeader'

import ManagerSidebar from './components/manager/ManagerSidebar'
import ManagerHeader from './components/manager/ManagerHeader'

import KitchenSidebar from './components/kitchen/KitchenSidebar'
import KitchenHeader from './components/kitchen/KitchenHeader'

import ReceptionistSidebar from './components/receptionist/ReceptionistSidebar'
import ReceptionistHeader from './components/receptionist/ReceptionistHeader'

import DeliverySidebar from './components/delivery/DeliverySidebar'
import DeliveryHeader from './components/delivery/DeliveryHeader'

// Common staff auth pages
import StaffLoginPage from './pages/auth/StaffLoginPage'
import StaffChangePasswordPage from './pages/auth/StaffChangePasswordPage'
import ProfilePage from './pages/ProfilePage'

// Common protected route component
import ProtectedRoute from './components/common/ProtectedRoute'

// Super Admin
import SuperAdminDashboardPage from './pages/superadmin/DashboardPage'
import StaffListPage from './pages/superadmin/StaffListPage'
import CreateStaffPage from './pages/superadmin/CreateStaffPage'
import StaffDetailsPage from './pages/superadmin/StaffDetailsPage'
import EditStaffPage from './pages/superadmin/EditStaffPage'
import BranchListPage from './pages/superadmin/BranchListPage'
import CreateBranchPage from './pages/superadmin/CreateBranchPage'
import BranchDetailsPage from './pages/superadmin/BranchDetailsPage'
import EditBranchPage from './pages/superadmin/EditBranchPage'
import SystemConfigPage from './pages/superadmin/SystemConfigPage'
import AuditLogsPage from './pages/superadmin/AuditLogsPage'
import RolesPage from './pages/superadmin/RolesPage'
import ComingSoonPage from './pages/superadmin/ComingSoonPage'
import CustomerManagementPage from './pages/superadmin/CustomerManagement'

// Manager pages
import ManagerDashboardPage from './pages/manager/ManagerDashboardPage'
import ManagerInventoryPage from './pages/manager/ManagerInventoryPage'
import ManagerDriversPage from './pages/manager/ManagerDriversPage'

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import MenuManagementPage from './pages/admin/MenuManagementPage'
import AddCategoryPage from './pages/admin/AddCategoryPage'
import AddMenuItemPage from './pages/admin/AddMenuItemPage'
import EditMenuItemPage from './pages/admin/EditMenuItemPage'
import TableManagementPage from './pages/admin/TableManagementPage'
import AddTablePage from './pages/admin/AddTablePage'
import TableQrPage from './pages/admin/TableQrPage'
import CouponsPage from './pages/admin/CouponsPage'

// Customer pages
import HomePage from './pages/customer/HomePage'
import MenuPage from './pages/customer/MenuPage'
import CartPage from './pages/customer/CartPage'
import CheckoutPage from './pages/customer/CheckoutPage'
import CardPaymentPage from './pages/customer/CardPaymentPage'
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage'
import CustomerLoginPage from './pages/customer/LoginPage'
import SignupPersonalPage from './pages/customer/SignupPersonalPage'
import SignupAddressPage from './pages/customer/SignupAddressPage'
import MobileVerificationPage from './pages/customer/MobileVerificationPage'
import OtpVerificationPage from './pages/customer/OtpVerificationPage'
import AccountPage from './pages/customer/AccountPage'
import OrdersPage from './pages/customer/OrdersPage'
import ScanPage from './pages/customer/ScanPage'
import CustomerProtectedRoute from './components/customer/CustomerProtectedRoute'

// Kitchen pages
import KitchenDashboardPage from './pages/kitchen/KitchenDashboardPage'
import KitchenOrdersPage from './pages/kitchen/KitchenOrdersPage'
import ChefsPage from './pages/kitchen/ChefsPage'
import InventoryPage from './pages/kitchen/InventoryPage'
import MenuAndRecipesPage from './pages/kitchen/MenuAndRecipesPage'
import ApprovalsPage from './pages/kitchen/ApprovalsPage'

// Receptionist pages
import ReceptionistDashboardPage from './pages/receptionist/ReceptionistDashboardPage'

function isTokenExpired(token) {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

// Customer / QR token cleanup only.
function AuthGuard() {
  const location = useLocation()

  useEffect(() => {
    const customerJwt = localStorage.getItem('customer_jwt')
    const qrSessionToken = localStorage.getItem('qr_session_token')

    if (customerJwt && isTokenExpired(customerJwt)) {
      localStorage.removeItem('customer_jwt')
      localStorage.removeItem('customer_role')
      localStorage.removeItem('customer_user_id')
      localStorage.removeItem('customer_name')
    }

    if (qrSessionToken && isTokenExpired(qrSessionToken)) {
      localStorage.removeItem('qr_session')
      localStorage.removeItem('qr_session_token')
      localStorage.removeItem('qr_branch_id')
      localStorage.removeItem('qr_table_id')
    }
  }, [location.pathname])

  return null
}

function CustomerLayout() {
  return (
    <CartProvider>
      <AuthGuard />
      <Outlet />
    </CartProvider>
  )
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Public common staff login */}
        <Route path="/staff/login" element={<StaffLoginPage />} />

        {/* Common password change page for all logged-in staff roles */}
        <Route
          path="/staff/change-password"
          element={
            <ProtectedRoute>
              <StaffChangePasswordPage />
            </ProtectedRoute>
          }
        />

        {/* SUPER_ADMIN area */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <MainLayout
                Sidebar={SuperAdminSidebar}
                Header={SuperAdminHeader}
              />
            </ProtectedRoute>
          }
        >
          <Route index element={<SuperAdminDashboardPage />} />

          <Route path="profile" element={<ProfilePage />} />
          <Route path="roles" element={<RolesPage />} />

          <Route path="staff" element={<StaffListPage />} />
          <Route path="staff/create" element={<CreateStaffPage />} />
          <Route path="staff/:id" element={<StaffDetailsPage />} />
          <Route path="staff/:id/edit" element={<EditStaffPage />} />

          <Route path="branches" element={<BranchListPage />} />
          <Route path="branches/create" element={<CreateBranchPage />} />
          <Route path="branches/:id" element={<BranchDetailsPage />} />
          <Route path="branches/:id/edit" element={<EditBranchPage />} />

          <Route path="customers" element={<CustomerManagementPage />} />

          <Route path="config" element={<SystemConfigPage />} />
          <Route path="audit" element={<AuditLogsPage />} />

          <Route path="*" element={<Navigate to="/staff" replace />} />
        </Route>

        {/* ADMIN area */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <MainLayout Sidebar={AdminSidebar} Header={AdminHeader} />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />

          <Route path="profile" element={<ProfilePage />} />

          {/* Shared staff management pages.
            Files are still inside pages/superadmin for now,
            but the routes are shared by SUPER_ADMIN and ADMIN. */}
          <Route path="staff" element={<StaffListPage />} />
          <Route path="staff/create" element={<CreateStaffPage />} />
          <Route path="staff/:id" element={<StaffDetailsPage />} />
          <Route path="staff/:id/edit" element={<EditStaffPage />} />

          <Route path="tables" element={<TableManagementPage />} />
          <Route path="tables/add" element={<AddTablePage />} />
          <Route path="tables/:tableId/qr" element={<TableQrPage />} />
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="menu/category/add" element={<AddCategoryPage />} />
          <Route path="menu/add" element={<AddMenuItemPage />} />
          <Route path="menu/edit" element={<EditMenuItemPage />} />
          <Route path="coupons" element={<CouponsPage />} />

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* MANAGER area */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <MainLayout Sidebar={ManagerSidebar} Header={ManagerHeader} />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManagerDashboardPage />} />
          <Route path="orders" element={<ComingSoonPage />} />
          <Route path="reports" element={<ComingSoonPage />} />
          <Route path="staff" element={<ComingSoonPage />} />
          <Route path="inventory" element={<ManagerInventoryPage />} />
          <Route path="drivers" element={<ManagerDriversPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route path="*" element={<Navigate to="/manager" replace />} />
        </Route>

        {/* DELIVERY area */}
        <Route
          path="/delivery"
          element={
            <ProtectedRoute allowedRoles={['DELIVERY']}>
              <MainLayout Sidebar={DeliverySidebar} Header={DeliveryHeader} />
            </ProtectedRoute>
          }
        >
          <Route index element={<ComingSoonPage />} />
          <Route path="orders" element={<ComingSoonPage />} />
          <Route path="routes" element={<ComingSoonPage />} />
          <Route path="status" element={<ComingSoonPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route path="*" element={<Navigate to="/delivery" replace />} />
        </Route>

        {/* Customer routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <CustomerProtectedRoute
                requireCustomerJwt
                qrOnlyRedirect="/signup/qr?redirect=/checkout"
                unauthenticatedRedirect="/login?redirect=/checkout"
              >
                <CheckoutPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <CustomerProtectedRoute
                requireCustomerJwt
                qrOnlyRedirect="/signup/qr?redirect=/payment"
                unauthenticatedRedirect="/login?redirect=/payment"
              >
                <CardPaymentPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <CustomerProtectedRoute
                requireCustomerJwt
                qrOnlyRedirect="/signup/qr?redirect=/order-confirmation"
                unauthenticatedRedirect="/login?redirect=/order-confirmation"
              >
                <OrderConfirmationPage />
              </CustomerProtectedRoute>
            }
          />
          <Route path="/login" element={<CustomerLoginPage />} />
          <Route path="/signup" element={<SignupPersonalPage />} />
          <Route path="/signup/address" element={<SignupAddressPage />} />
          <Route path="/signup/qr" element={<MobileVerificationPage />} />
          <Route path="/signup/qr/opt" element={<OtpVerificationPage />} />
          <Route path="/verify-otp" element={<OtpVerificationPage />} />
          <Route path="/scan/:qrToken?" element={<ScanPage />} />
          <Route
            path="/account"
            element={
              <CustomerProtectedRoute
                requireCustomerJwt
                qrOnlyRedirect="/signup/qr?redirect=/account"
                unauthenticatedRedirect="/login?redirect=/account"
              >
                <AccountPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <CustomerProtectedRoute
                requireCustomerJwt
                qrOnlyRedirect="/signup/qr?redirect=/orders"
                unauthenticatedRedirect="/login?redirect=/orders"
              >
                <OrdersPage />
              </CustomerProtectedRoute>
            }
          />
        </Route>

        {/* CHEF / KITCHEN area */}
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute allowedRoles={['CHEF']}>
              <MainLayout Sidebar={KitchenSidebar} Header={KitchenHeader} />
            </ProtectedRoute>
          }
        >
          <Route index element={<KitchenDashboardPage />} />
          <Route path="orders" element={<KitchenOrdersPage />} />
          <Route path="chefs" element={<ChefsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="menu" element={<MenuAndRecipesPage />} />
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route path="*" element={<Navigate to="/kitchen" replace />} />
        </Route>

        {/* RECEPTIONIST area */}
        <Route
          path="/receptionist"
          element={
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
              <MainLayout
                Sidebar={ReceptionistSidebar}
                Header={ReceptionistHeader}
              />
            </ProtectedRoute>
          }
        >
          <Route index element={<ReceptionistDashboardPage />} />

          <Route path="orders" element={<ComingSoonPage />} />
          <Route path="tables" element={<ComingSoonPage />} />
          <Route path="settings" element={<ComingSoonPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route path="*" element={<Navigate to="/receptionist" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false} // Show the timer bar
        theme="colored" // Keep this for vibrant colors
        pauseOnHover={true} // Stop the timer if the mouse is over it
      />
    </>
  )
}
