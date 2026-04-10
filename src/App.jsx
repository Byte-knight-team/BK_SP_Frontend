import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MenuManagementPage from './pages/MenuManagementPage';
import AddMenuItemPage from './pages/AddMenuItemPage';
import EditMenuItemPage from './pages/EditMenuItemPage';

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/menu" element={<MenuManagementPage />} />
        <Route path="/admin/menu/add" element={<AddMenuItemPage />} />
        <Route path="/admin/menu/edit" element={<EditMenuItemPage />} />
      </Routes>
    </CartProvider>
  );
}
