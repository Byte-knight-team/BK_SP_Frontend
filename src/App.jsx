import { Routes, Route, Outlet} from "react-router-dom";
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

//Create a wrapper component to add cart context
function CustomerLayout() {
  return (
    <CartProvider>
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
