import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CartProvider } from "./context/CartContext";

// Layouts & Components
import MainLayout from "./layouts/MainLayout";
import KitchenSidebar from "./components/kitchen/KitchenSidebar";
import KitchenHeader from "./components/kitchen/KitchenHeader";
import ReceptionistSidebar from "./components/receptionist/ReceptionistSidebar";
import ReceptionistHeader from "./components/receptionist/ReceptionistHeader";

// Customer Pages (New Paths from Dev)
import HomePage from "./pages/customer/HomePage";
import MenuPage from "./pages/customer/MenuPage";
import CartPage from "./pages/customer/CartPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import CardPaymentPage from "./pages/customer/CardPaymentPage";
import OrderConfirmationPage from "./pages/customer/OrderConfirmationPage";
import LoginPage from "./pages/customer/LoginPage";
import SignupPersonalPage from "./pages/customer/SignupPersonalPage";
import SignupAddressPage from "./pages/customer/SignupAddressPage";
import MobileVerificationPage from "./pages/customer/MobileVerificationPage";
import OtpVerificationPage from "./pages/customer/OtpVerificationPage";
import AccountPage from "./pages/customer/AccountPage";
import OrdersPage from "./pages/customer/OrdersPage";
import ScanPage from "./pages/customer/ScanPage";

// Admin Pages
import AdminDashboardPage from "./pages/AdminDashboardPage";
import MenuManagementPage from "./pages/MenuManagementPage";
import AddMenuItemPage from "./pages/AddMenuItemPage";
import EditMenuItemPage from "./pages/EditMenuItemPage";
import TableManagementPage from "./pages/TableManagementPage";
import AddTablePage from "./pages/AddTablePage";
import UserManagementPage from "./pages/UserManagementPage";
import AddNewUserPage from "./pages/AddNewUserPage";

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

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// Global invisible guard that checks tokens on every route change on customer route
function AuthGuard() {
  const location = useLocation();

  useEffect(() => {
    const customerJwt = localStorage.getItem('customer_jwt');
    const qrSessionToken = localStorage.getItem('qr_session_token');

    let changed = false;

    // Auto-drop expired customer JWT
    if (customerJwt && isTokenExpired(customerJwt)) {
      localStorage.removeItem('customer_jwt');
      localStorage.removeItem('customer_role');
      localStorage.removeItem('customer_user_id');
      localStorage.removeItem('customer_name');
      changed = true;
    }

    // Auto-drop expired QR session token
    if (qrSessionToken && isTokenExpired(qrSessionToken)) {
      localStorage.removeItem('qr_session');
      localStorage.removeItem('qr_session_token');
      localStorage.removeItem('qr_branch_id');
      localStorage.removeItem('qr_table_id');
      changed = true;
    }
  }, [location.pathname]);

  return null;
}


// Wrapper for Cart Context
function CustomerLayout() {
  return (
    <CartProvider>
      <AuthGuard />
      {/*Render the matching child routes*/}
      <Outlet />
    </CartProvider>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Customer Routes with Cart Provider */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<CardPaymentPage />} />
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

      {/* Admin Section */}
      <Route path="/admin">
        <Route index element={<AdminDashboardPage />} />
        <Route path="menu" element={<MenuManagementPage />} />
        <Route path="menu/add" element={<AddMenuItemPage />} />
        <Route path="menu/edit" element={<EditMenuItemPage />} />
        <Route path="tables" element={<TableManagementPage />} />
        <Route path="tables/add" element={<AddTablePage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="users/add" element={<AddNewUserPage />} />
      </Route>

      {/* Kitchen Section with Sidebar and Header */}
      <Route path="/kitchen" element={<MainLayout Sidebar={KitchenSidebar} Header={KitchenHeader} />}>
        <Route index element={<KitchenDashboardPage />} />
        <Route path="orders" element={<KitchenOrdersPage />} />
        <Route path="chefs" element={<ChefsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="menu" element={<MenuAndRecipesPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="settings" element={<KitchenSettingsPage />} />
      </Route>

      {/* Receptionist Section */}
      <Route path="/receptionist" element={<MainLayout Sidebar={ReceptionistSidebar} Header={ReceptionistHeader} />}>
        <Route index element={<ReceptionistDashboardPage />} />
      </Route>
    </Routes>
  );
}