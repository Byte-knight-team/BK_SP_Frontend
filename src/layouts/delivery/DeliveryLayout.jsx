import { useState, useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppSidebar from "../../components/common/AppSidebar";
import DeliveryHeader from "../../components/delivery/DeliveryHeader";
import ActiveOrderBanner from "../../components/delivery/ActiveOrderBanner";
import { deliveryNav } from "../../config/nav/deliveryNav";
import { DeliveryService } from "../../apis/delivery/DeliveryService";

export default function DeliveryLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    fetchActiveOrder();
    // Refresh active order status every 30s
    const interval = setInterval(fetchActiveOrder, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveOrder = async () => {
    try {
      const response = await DeliveryService.getActiveOrder();
      setActiveOrder(response.data);
    } catch (error) {
      console.error("Failed to fetch active order:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/staff/login", { replace: true });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <AppSidebar
          navItems={deliveryNav}
          branchName={user?.branchName || "Assigned Branch"}
          userName={user?.fullName || user?.username || user?.email || "Driver"}
          roleLabel={user?.roleName || "DELIVERY"}
          profilePath="/delivery/profile"
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <DeliveryHeader branchName={user?.branchName} />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 px-4 py-4 lg:px-8 lg:py-8">
          <Outlet />
        </main>

        {/* Global Active Order Banner */}
        <ActiveOrderBanner order={activeOrder} />

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
          {deliveryNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 transition-all ${
                  active ? "text-orange-500" : "text-gray-400"
                }`}
              >
                <div className={`p-2 rounded-xl ${active ? "bg-orange-50" : ""}`}>
                  <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
