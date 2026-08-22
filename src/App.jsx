import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isTokenExpired } from './utils/authToken'
import { CartProvider } from './context/CartContext'
import GlobalNotificationProvider from './context/GlobalNotificationProvider'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'

// Fallback loader
import PageLoader from './components/common/PageLoader'

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
import KitchenNotifier from './components/kitchen/KitchenNotifier'

import LineChefSidebar from './components/line-chef/LineChefSidebar'
import LineChefHeader from './components/line-chef/LineChefHeader'
import LineChefNotifier from './components/line-chef/LineChefNotifier'

import ReceptionistSidebar from './components/receptionist/ReceptionistSidebar'
import ReceptionistHeader from './components/receptionist/ReceptionistHeader'
import ReceptionistNotifier from './components/receptionist/ReceptionistNotifier'

// Common staff auth pages
const StaffLoginPage = lazy(() => import('./pages/auth/StaffLoginPage'))
const StaffChangePasswordPage = lazy(() => import('./pages/auth/StaffChangePasswordPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

// Common protected route component
import ProtectedRoute from './components/common/ProtectedRoute'

// Super Admin
const SuperAdminDashboardPage = lazy(() => import('./pages/superadmin/DashboardPage'))
const StaffListPage = lazy(() => import('./pages/superadmin/StaffListPage'))
const CreateStaffPage = lazy(() => import('./pages/superadmin/CreateStaffPage'))
const StaffDetailsPage = lazy(() => import('./pages/superadmin/StaffDetailsPage'))
const EditStaffPage = lazy(() => import('./pages/superadmin/EditStaffPage'))
const BranchListPage = lazy(() => import('./pages/superadmin/BranchListPage'))
const CreateBranchPage = lazy(() => import('./pages/superadmin/CreateBranchPage'))
const BranchDetailsPage = lazy(() => import('./pages/superadmin/BranchDetailsPage'))
const EditBranchPage = lazy(() => import('./pages/superadmin/EditBranchPage'))
const SystemConfigPage = lazy(() => import('./pages/superadmin/SystemConfigPage'))
const AuditLogsPage = lazy(() => import('./pages/superadmin/AuditLogsPage'))
const ReportsPage = lazy(() => import('./pages/superadmin/ReportsPage'))
const RolesPage = lazy(() => import('./pages/superadmin/RolesPage'))
const ComingSoonPage = lazy(() => import('./pages/superadmin/ComingSoonPage'))
const CustomerManagement = lazy(() => import('./pages/superadmin/CustomerManagement'))
const CustomerDetailsPage = lazy(() => import('./pages/superadmin/CustomerDetailsPage'))
const CategoryManagementPage = lazy(() => import('./pages/superadmin/CategoryManagementPage'))
const CreateCategoryPage = lazy(() => import('./pages/superadmin/CreateCategoryPage'))
const EditCategoryPage = lazy(() => import('./pages/superadmin/EditCategoryPage'))
const CategoryDetailsPage = lazy(() => import('./pages/superadmin/CategoryDetailsPage'))

// Manager pages
const ManagerDashboardPage = lazy(() => import('./pages/manager/ManagerDashboardPage'))
const ManagerSalesSummaryPage = lazy(() => import('./pages/manager/ManagerSalesSummaryPage'))
const ManagerInventoryPage = lazy(() => import('./pages/manager/ManagerInventoryPage'))
const ManagerDriversPage = lazy(() => import('./pages/manager/ManagerDriversPage'))
const ManagerStaffPage = lazy(() => import('./pages/manager/ManagerStaffPage'))
const ManagerReportsPage = lazy(() => import('./pages/manager/ManagerReportsPage'))
const ManagerProcurementPage = lazy(() => import('./pages/manager/ManagerProcurementPage'))

// Admin pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const MenuManagementPage = lazy(() => import('./pages/admin/MenuManagementPage'))
const MenuUpdateRequestsPage = lazy(() => import('./pages/admin/MenuUpdateRequestsPage'))
const AddCategoryPage = lazy(() => import('./pages/admin/AddCategoryPage'))
const MenuItemDetailsPage = lazy(() => import('./pages/admin/MenuItemDetailsPage'))
const TableManagementPage = lazy(() => import('./pages/admin/TableManagementPage'))
const TableDetailsPage = lazy(() => import('./pages/admin/TableDetailsPage'))
const AddTablePage = lazy(() => import('./components/admin/AddTablePage'))
const TableQrPage = lazy(() => import('./pages/admin/TableQrPage'))
const CouponsPage = lazy(() => import('./pages/superadmin/CouponsPage'))
const CouponDetailsPage = lazy(() => import('./pages/superadmin/CouponDetailsPage'))

// Customer pages
const HomePage = lazy(() => import('./pages/customer/HomePage'))
const MenuPage = lazy(() => import('./pages/customer/MenuPage'))
const CartPage = lazy(() => import('./pages/customer/CartPage'))
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage'))
const CardPaymentPage = lazy(() => import('./pages/customer/CardPaymentPage'))
const OrderConfirmationPage = lazy(() => import('./pages/customer/OrderConfirmationPage'))
const CustomerLoginPage = lazy(() => import('./pages/customer/LoginPage'))
const ForgotPasswordPage = lazy(() => import('./pages/customer/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/customer/ResetPasswordPage'))
const SignupPersonalPage = lazy(() => import('./pages/customer/SignupPersonalPage'))
const SignupAddressPage = lazy(() => import('./pages/customer/SignupAddressPage'))
const MobileVerificationPage = lazy(() => import('./pages/customer/MobileVerificationPage'))
const OtpVerificationPage = lazy(() => import('./pages/customer/OtpVerificationPage'))
const AccountPage = lazy(() => import('./pages/customer/AccountPage'))
const OrdersPage = lazy(() => import('./pages/customer/OrdersPage'))
const VerifyEmailPage = lazy(() => import('./pages/customer/VerifyEmailPage'))
const StatisticsPage = lazy(() => import('./pages/customer/StatisticsPage'))
const ScanPage = lazy(() => import('./pages/customer/ScanPage'))
import CustomerProtectedRoute from './components/customer/CustomerProtectedRoute'
const CustomerReservationsListPage = lazy(() => import('./pages/customer/CustomerReservationsListPage'))
const CustomerReservationDetailPage = lazy(() => import('./pages/customer/ReservationDetailPage'))

// Kitchen pages
const KitchenDashboardPage = lazy(() => import('./pages/kitchen/KitchenDashboardPage'))
const KitchenOrdersPage = lazy(() => import('./pages/kitchen/KitchenOrdersPage'))
const ChefsPage = lazy(() => import('./pages/kitchen/ChefsPage'))
const InventoryPage = lazy(() => import('./pages/kitchen/InventoryPage'))
const InventoryRequestsPage = lazy(() => import('./pages/kitchen/InventoryRequestsPage'))
const MenuItemPage = lazy(() => import('./pages/kitchen/MenuItemPage'))

// Line Chef pages
const LineChefDashboard = lazy(() => import('./pages/line-chef/LineChefDashboard'))
const LineChefHistoryPage = lazy(() => import('./pages/line-chef/LineChefHistoryPage'))

// Receptionist pages
const ReceptionistDashboardPage = lazy(() => import('./pages/receptionist/ReceptionistDashboardPage'))
const ReceptionistTablePage = lazy(() => import('./pages/receptionist/TableManagementPage'))
const OrderManagementPage = lazy(() => import('./pages/receptionist/OrderManagementPage'))
const ReservationsPage = lazy(() => import('./pages/receptionist/ReservationsPage'))



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

      // Auto-logout customer when QR session drops
      localStorage.removeItem('customer_jwt')
      localStorage.removeItem('customer_role')
      localStorage.removeItem('customer_user_id')
      localStorage.removeItem('customer_name')
      localStorage.removeItem('customer_profile_pic')
    }
  }, [location.pathname])

  return null
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
})

function CustomerLayout() {
  return (
    <CartProvider>
      <AuthGuard />
      <GlobalNotificationProvider />
      <Outlet />
    </CartProvider>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
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
                contentClassName="[&>*]:mx-auto"
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

          <Route path="/staff/customers" element={<CustomerManagement />} />
          <Route path="/staff/customers/:id" element={<CustomerDetailsPage />} />
          <Route path="categories" element={<CategoryManagementPage />} />
          <Route path="categories/create" element={<CreateCategoryPage />} />
          <Route path="categories/:id" element={<CategoryDetailsPage />} />
          <Route path="categories/:id/edit" element={<EditCategoryPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="coupons/:id" element={<CouponDetailsPage />} />

          <Route path="config" element={<SystemConfigPage />} />
          <Route path="audit" element={<AuditLogsPage />} />
          <Route path="reports" element={<ReportsPage />} />

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
          <Route path="tables/:id" element={<TableDetailsPage />} />
          <Route path="tables/:tableId/qr" element={<TableQrPage />} />
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="menu/category/add" element={<AddCategoryPage />} />
          <Route path="menu/:id" element={<MenuItemDetailsPage />} />
          <Route path="menu-requests" element={<MenuUpdateRequestsPage />} />

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
          <Route path="sales" element={<ManagerSalesSummaryPage />} />
          <Route path="orders" element={<ComingSoonPage />} />
          <Route path="reports" element={<ManagerReportsPage />} />
          <Route path="staff" element={<ManagerStaffPage />} />
          <Route path="inventory" element={<ManagerInventoryPage />} />
          <Route path="procurement" element={<ManagerProcurementPage />} />
          <Route path="drivers" element={<ManagerDriversPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route path="*" element={<Navigate to="/manager" replace />} />
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
          {/* Customer Auth Pages */}
          <Route path="/login" element={<CustomerLoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
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
            path="/verify-email"
            element={
              <CustomerProtectedRoute
                requireCustomerJwt
                qrOnlyRedirect="/signup/qr?redirect=/verify-email"
                unauthenticatedRedirect="/login?redirect=/verify-email"
              >
                <VerifyEmailPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/statistics"
            element={
              <CustomerProtectedRoute
                requireCustomerJwt
                qrOnlyRedirect="/signup/qr?redirect=/statistics"
                unauthenticatedRedirect="/login?redirect=/statistics"
              >
                <StatisticsPage />
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
          <Route
            path="/reservations"
            element={
              <CustomerProtectedRoute
                requireCustomerJwt
                qrOnlyRedirect="/signup/qr?redirect=/reservations"
                unauthenticatedRedirect="/login?redirect=/reservations"
              >
                <CustomerReservationsListPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/reservations/:id"
            element={
              <CustomerProtectedRoute
                requireCustomerJwt
                qrOnlyRedirect="/signup/qr?redirect=/reservations"
                unauthenticatedRedirect="/login?redirect=/reservations"
              >
                <CustomerReservationDetailPage />
              </CustomerProtectedRoute>
            }
          />
        </Route>


        {/* CHEF / KITCHEN area */}
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute allowedRoles={['CHEF']}>
              {/* Global kitchen notifications — active on every /kitchen page */}
              <KitchenNotifier />
              <MainLayout Sidebar={KitchenSidebar} Header={KitchenHeader} />
            </ProtectedRoute>
          }
        >
          <Route index element={<KitchenDashboardPage />} />
          <Route path="orders" element={<KitchenOrdersPage />} />
          <Route path="chefs" element={<ChefsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="requests" element={<InventoryRequestsPage />} />
          <Route path="menu" element={<MenuItemPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route path="*" element={<Navigate to="/kitchen" replace />} />
        </Route>
        {/* RECEPTIONIST area */}
        <Route
          path="/receptionist"
          element={
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
              {/* Global receptionist notifications — active on every /receptionist page */}
              <ReceptionistNotifier />
              <MainLayout
                Sidebar={ReceptionistSidebar}
                Header={ReceptionistHeader}
              />
            </ProtectedRoute>
          }
        >
          <Route index element={<ReceptionistDashboardPage />} />
          <Route path="tables" element={<ReceptionistTablePage />} />
          <Route path="orders" element={<OrderManagementPage />} />
          <Route path="reservations" element={<ReservationsPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route path="*" element={<Navigate to="/receptionist" replace />} />
        </Route>

        {/* LINE_CHEF area */}
        <Route
          path="/line-chef"
          element={
            <ProtectedRoute allowedRoles={['LINE_CHEF']}>
              {/* Global line-chef notifications — active on every line-chef page */}
              <LineChefNotifier />
              <MainLayout Sidebar={LineChefSidebar} Header={LineChefHeader} />
            </ProtectedRoute>
          }
        >
          <Route index element={<LineChefDashboard />} />
          <Route path="history" element={<LineChefHistoryPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route path="*" element={<Navigate to="/line-chef" replace />} />
        </Route>

        {/* DELIVERY area */}
        <Route
          path="/delivery"
          element={
            <ProtectedRoute allowedRoles={["DELIVERY"]}>
              <ComingSoonPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false} // Show the timer bar
        newestOnTop
        closeOnClick
        theme="colored" // Keep this for vibrant colors
        pauseOnHover={true} // Stop the timer if the mouse is over it
        draggable
        limit={3}
      />
    </QueryClientProvider>
  )
}
