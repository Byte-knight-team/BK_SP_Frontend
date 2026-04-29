import Stats from "../../components/kitchen/Dashboard/Stats";
import MostPopularMeals from "../../components/kitchen/Dashboard/MostPopularMeals";
import PeakHoursChart from "../../components/kitchen/Dashboard/PeakHoursChart";
import InventoryAlerts from "../../components/kitchen/Dashboard/InventoryAlerts";
import PendingOrders from "../../components/kitchen/Dashboard/PendingOrders";
import PreparingOrders from "../../components/kitchen/Dashboard/PreparingOrders";
import ActiveAlertsCard from "../../components/kitchen/Dashboard/ActiveAlertsCards";
import AlertModal from "../../components/kitchen/Dashboard/AlertModal";
import { getActiveAlertsAPI } from "../../apis/kitchen/alerts";

import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { LayoutDashboard, Megaphone } from "lucide-react";

const KitchenDashboardPage = () => {
  const { setHeaderInfo } = useOutletContext();
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch alerts from backend
  const fetchAlerts = async () => {
    const { data } = await getActiveAlertsAPI();
    if (data) setActiveAlerts(data);
  };

  useEffect(() => {
    // set the header info for this page
    setHeaderInfo({
      title: "Kitchen Dashboard Overview",
      description: "Real-time performance metrics for Crave House",
      Icon: LayoutDashboard,
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4">

      {/* KPI GRID */}
      <div className="mt-4 grid grid-cols-4 gap-3">
        <Stats />
      </div>

      {/* MAIN CONTENT */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {/* SECTION: POPULAR MEALS */}
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <MostPopularMeals />
        </div>

        {/* SECTION: PEAK HOURS */}
        <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <PeakHoursChart />
        </div>

        {/* --- NEW KITCHEN ALERTS CARD --- */}
        <div className="relative">
          <ActiveAlertsCard alerts={activeAlerts} onRefresh={fetchAlerts} />
          
          {/* Floating Report Button inside the card area */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="absolute top-6 right-20 flex items-center gap-2 rounded-full bg-orange-600 px-4 py-1.5 text-[10px] font-bold text-white shadow-lg transition-all hover:bg-orange-700 active:scale-95"
          >
            <Megaphone size={14} /> BROADCAST
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-2xl bg-white p-4 shadow-sm border border-gray-50">
          <PendingOrders />
        </div>
        <div className="lg:col-span-1 rounded-2xl bg-white p-4 shadow-sm border border-gray-50">
          <PreparingOrders />
        </div>
        
        {/* MOVED INVENTORY ALERTS TO THE BOTTOM ROW */}
        <div className="lg:col-span-1 rounded-2xl bg-white p-6 shadow-sm border border-gray-50">
          <InventoryAlerts />
        </div>
      </div>

      {/* THE MODAL */}
      <AlertModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAlertSent={fetchAlerts} 
      />
    </div>
  );
};

export default KitchenDashboardPage;
