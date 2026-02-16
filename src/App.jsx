import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import ChefManagement from './pages/kitchen/ChefManagement';
import OrderDetails from './pages/kitchen/OrderDetails';

export default function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          {/* Online Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />

          {/* Kitchen Routes */}
          <Route path="/kitchen" element={<KitchenDashboard />} />
          <Route path="/kitchen/chef-management" element={<ChefManagement />} />
          <Route path="/kitchen/order/:orderId" element={<OrderDetails />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}
