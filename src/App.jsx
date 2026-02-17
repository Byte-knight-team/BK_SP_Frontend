import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardOverview from './pages/DashboardOverview';
import Orders from './pages/Orders';
import Chefs from './pages/Chefs';
import Inventory from './pages/Inventory';
import MenuRecipes from './pages/MenuRecipes';
import Approvals from './pages/Approvals';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/chefs" element={<Chefs />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/menu-recipes" element={<MenuRecipes />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

