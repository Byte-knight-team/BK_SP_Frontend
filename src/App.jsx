import React from "react";
import { Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import MenuManagementPage from "./pages/MenuManagementPage";
import AddMenuItemPage from "./pages/AddMenuItemPage";
import EditMenuItemPage from "./pages/EditMenuItemPage";
import TableManagementPage from "./pages/TableManagementPage";
import UserManagementPage from "./pages/UserManagementPage";
import AddNewUserPage from "./pages/AddNewUserPage";
import LoginPage from "./pages/LoginPage";
import SignupPersonalPage from "./pages/SignupPersonalPage";
import SignupAddressPage from "./pages/SignupAddressPage";
import MobileVerificationPage from "./pages/MobileVerificationPage";
import OtpVerificationPage from "./pages/OtpVerificationPage";
import AccountPage from "./pages/AccountPage";
import OrdersPage from "./pages/OrdersPage";
import { KitchenDashboardPage } from "./pages/kitchen/DashboardPage";
import KitchenLayout from "./layouts/KitchenLayout";

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
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/menu" element={<MenuManagementPage />} />
        <Route path="/admin/menu/add" element={<AddMenuItemPage />} />
        <Route path="/admin/menu/edit" element={<EditMenuItemPage />} />
        <Route path="/admin/tables" element={<TableManagementPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/users/add" element={<AddNewUserPage />} />
          {/* Kitchen Layout එක parent කෙනෙක් විදිහට දානවා */}
          <Route path="/kitchen" element={<KitchenLayout />}>
            {/* මේවා KitchenLayout එකේ 'Outlet' කියන තැනට ලෝඩ් වෙයි */}
            <Route index element={<KitchenDashboardPage />} />
            {/* <Route path="orders" element={<KitchenOrdersPage />} /> */}
            {/* <Route path="inventory" element={<KitchenInventoryPage />} /> */}
          </Route>
      </Routes>
    </CartProvider>
  );
}
