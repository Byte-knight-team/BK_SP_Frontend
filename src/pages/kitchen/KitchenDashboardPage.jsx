import Stats from "../../components/kitchen/dashboard/Stats";
import MostPopularMeals from "../../components/kitchen/dashboard/MostPopularMeals";
import PeakHoursChart from "../../components/kitchen/dashboard/PeakHoursChart";
import InventoryAlerts from "../../components/kitchen/dashboard/InventoryAlerts";
import PendingOrders from "../../components/kitchen/dashboard/PendingOrders";
import PreparingOrders from "../../components/kitchen/dashboard/PreparingOrders";
import { useOutletContext } from "react-router-dom";
import { useEffect } from "react";
import { LayoutDashboard } from "lucide-react";

const KitchenDashboardPage = () => {
  const { setHeaderInfo } = useOutletContext();

  useEffect(() => {
    // set the header info for this page
    setHeaderInfo({
      title: "Kitchen Dashboard Overview",
      description: "Real-time performance metrics for Crave House",
      Icon: LayoutDashboard,
    });
  }, [setHeaderInfo]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-6">

      {/* KPI GRID */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <Stats />
      </div>

      {/* MAIN CONTENT */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* SECTION: POPULAR MEALS */}
        <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <MostPopularMeals />
        </div>

        {/* SECTION: PEAK HOURS */}
        <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <PeakHoursChart />
        </div>

        {/* SECTION: INVENTORY ALERTS */}
        <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <InventoryAlerts />
        </div>
      </div>

      <div className="mt-6 flex gap-6">
        <div className="flex flex-1 flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <PendingOrders />
        </div>
        <div className="flex flex-1 flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <PreparingOrders />
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboardPage;
