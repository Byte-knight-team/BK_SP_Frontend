import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import ChefManagement from './pages/kitchen/ChefManagement';
import OrderDetails from './pages/kitchen/OrderDetails';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Kitchen Routes */}
        <Route path="/kitchen" element={<KitchenDashboard />} />
        <Route path="/kitchen/chef-management" element={<ChefManagement />} />
        <Route path="/kitchen/order/:orderId" element={<OrderDetails />} />
        
        {/* Default redirect to kitchen for now */}
        <Route path="/" element={<Navigate to="/kitchen" replace />} />
      </Routes>
    </Router>
  );
}
