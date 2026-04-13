import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import SignupPersonalPage from './pages/SignupPersonalPage';
import SignupAddressPage from './pages/SignupAddressPage';
import MobileVerificationPage from './pages/MobileVerificationPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import AccountPage from './pages/AccountPage';

export default function App() {
  return (
    <CartProvider>
      <Routes>
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
        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </CartProvider>
  );
}
