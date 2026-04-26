import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

// Layouts & Components
import MainLayout from "./layouts/MainLayout";
import KitchenSidebar from "./components/kitchen/KitchenSidebar";
import KitchenHeader from "./components/kitchen/KitchenHeader";
import ReceptionistSidebar from "./components/receptionist/ReceptionistSidebar";
import ReceptionistHeader from "./components/receptionist/ReceptionistHeader";
import SuperAdminSidebar from "./components/superadmin/SuperAdminSidebar";
import SuperAdminHeader from "./components/superadmin/SuperAdminHeader";
import ProtectedRoute from "./components/superadmin/ProtectedRoute";
import AuthenticatedRoute from "./components/superadmin/AuthenticatedRoute";

// Customer Pages
import HomePage from "./pages/customer/HomePage";
import MenuPage from "./pages/customer/MenuPage";
import CartPage from "./pages/customer/CartPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import OrderConfirmationPage from "./pages/customer/OrderConfirmationPage";
import LoginPage from "./pages/customer/LoginPage";
import SignupPersonalPage from "./pages/customer/SignupPersonalPage";
import SignupAddressPage from "./pages/customer/SignupAddressPage";
import MobileVerificationPage from "./pages/customer/MobileVerificationPage";
import OtpVerificationPage from "./pages/customer/OtpVerificationPage";
import AccountPage from "./pages/customer/AccountPage";
import OrdersPage from "./pages/customer/OrdersPage";
import ScanPage from "./pages/customer/ScanPage";

// Existing Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import MenuManagementPage from "./pages/admin/MenuManagementPage";
import AddMenuItemPage from "./pages/admin/AddMenuItemPage";
import EditMenuItemPage from "./pages/admin/EditMenuItemPage";
import AddCategoryPage from "./pages/admin/AddCategoryPage";
import TableManagementPage from "./pages/admin/TableManagementPage";
import AddTablePage from "./pages/admin/AddTablePage";
import TableQrPage from "./pages/admin/TableQrPage";
import UserManagementPage from "./pages/UserManagementPage";
import AddNewUserPage from "./pages/admin/AddNewUserPage";

// Kitchen Pages
import KitchenDashboardPage from "./pages/kitchen/KitchenDashboardPage";
import KitchenOrdersPage from "./pages/kitchen/KitchenOrdersPage";
import ChefsPage from "./pages/kitchen/ChefsPage";
import InventoryPage from "./pages/kitchen/InventoryPage";
import MenuAndRecipesPage from "./pages/kitchen/MenuAndRecipesPage";
import ApprovalsPage from "./pages/kitchen/ApprovalsPage";
import KitchenSettingsPage from "./pages/kitchen/KitchenSettingsPage";

// Receptionist Pages
import ReceptionistDashboardPage from "./pages/receptionist/ReceptionistDashboardPage";

// Staff Pages
import SuperAdminLoginPage from "./pages/superadmin/LoginPage";
import SuperAdminDashboardPage from "./pages/superadmin/DashboardPage";
import ComingSoonPage from "./pages/superadmin/ComingSoonPage";
import ChangePasswordPage from "./pages/superadmin/ChangePasswordPage";
import ProfilePage from "./pages/superadmin/ProfilePage";
import StaffListPage from "./pages/superadmin/StaffListPage";
import CreateStaffPage from "./pages/superadmin/CreateStaffPage";
import StaffDetailsPage from "./pages/superadmin/StaffDetailsPage";
import EditStaffPage from "./pages/superadmin/EditStaffPage";
import BranchListPage from "./pages/superadmin/BranchListPage";
import CreateBranchPage from "./pages/superadmin/CreateBranchPage";
import BranchDetailsPage from "./pages/superadmin/BranchDetailsPage";
import EditBranchPage from "./pages/superadmin/EditBranchPage";
import SystemConfigPage from "./pages/superadmin/SystemConfigPage";
import AuditLogsPage from "./pages/superadmin/AuditLogsPage";
import RolesPage from "./pages/superadmin/RolesPage";

function CustomerLayout() {
  return (
    <CartProvider>
      <Outlet />
    </CartProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPersonalPage />} />
          <Route path="/signup/address" element={<SignupAddressPage />} />
          <Route path="/signup/qr" element={<MobileVerificationPage />} />
          <Route path="/signup/qr/opt" element={<OtpVerificationPage />} />
          <Route path="/verify-otp" element={<OtpVerificationPage />} />
          <Route path="/scan/:qrToken?" element={<ScanPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>

        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute>
              <MainLayout Sidebar={AdminSidebar} Header={AdminHeader} />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="menu/category/add" element={<AddCategoryPage />} />
          <Route path="menu/add" element={<AddMenuItemPage />} />
          <Route path="menu/edit" element={<EditMenuItemPage />} />
          <Route path="tables" element={<TableManagementPage />} />
          <Route path="tables/add" element={<AddTablePage />} />
          <Route path="tables/:tableId/qr" element={<TableQrPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="users/add" element={<AddNewUserPage />} />
        </Route>

        <Route path="/staff/login" element={<SuperAdminLoginPage />} />

        <Route
          path="/staff/change-password"
          element={
            <AuthenticatedRoute>
              <ChangePasswordPage />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <MainLayout Sidebar={SuperAdminSidebar} Header={SuperAdminHeader} />
            </ProtectedRoute>
          }
        >
          <Route index element={<SuperAdminDashboardPage />} />
          <Route path="staff" element={<StaffListPage />} />
          <Route path="staff/create" element={<CreateStaffPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="branches" element={<BranchListPage />} />
          <Route path="branches/create" element={<CreateBranchPage />} />
          <Route path="branches/:id" element={<BranchDetailsPage />} />
          <Route path="branches/:id/edit" element={<EditBranchPage />} />
          <Route path="config" element={<SystemConfigPage />} />
          <Route path="audit" element={<AuditLogsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="staff/:id" element={<StaffDetailsPage />} />
          <Route path="staff/:id/edit" element={<EditStaffPage />} />
        </Route>

        <Route
          path="/kitchen"
          element={
            <ProtectedRoute>
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
          <Route path="settings" element={<KitchenSettingsPage />} />
        </Route>

        <Route
          path="/receptionist"
          element={
            <ProtectedRoute>
              <MainLayout Sidebar={ReceptionistSidebar} Header={ReceptionistHeader} />
            </ProtectedRoute>
          }
        >
          <Route index element={<ReceptionistDashboardPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}