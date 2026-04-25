import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CartProvider } from "./context/CartContext";
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

// Helper to check if a JWT/session token is expired
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

//Create a wrapper component to add cart context
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
    </Routes>
  );
}
