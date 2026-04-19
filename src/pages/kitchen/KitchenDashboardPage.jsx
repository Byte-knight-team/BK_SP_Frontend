import Stats from "../../components/kitchen/Dashboard/Stats";
import MostPopularMeals from "../../components/kitchen/Dashboard/MostPopularMeals";
import PeakHoursChart from "../../components/kitchen/Dashboard/PeakHoursChart";
import InventoryAlerts from "../../components/kitchen/Dashboard/InventoryAlerts";
import PendingOrders from "../../components/kitchen/Dashboard/PendingOrders";
import PreparingOrders from "../../components/kitchen/Dashboard/PreparingOrders";

const KitchenDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 1. TOP HEADER: Displays title and subtext */}
      <div className="p-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Kitchen Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Real-time performance metrics for Crave House
        </p>
      </div>

      {/* 2. KPI GRID: Displays key statistics using summary cards */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <Stats />
      </div>

      {/* 3. MAIN CONTENT: 3-Column Grid for advanced analytics and alerts */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* SECTION: POPULAR MEALS - Vertical bars showing best-selling items */}
        <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <MostPopularMeals />
        </div>

        {/* SECTION: PEAK HOURS - Bar chart visualizing kitchen busy times */}
        <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <PeakHoursChart />
        </div>

        {/* SECTION: INVENTORY ALERTS - Critical warnings for low stock items */}
        <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <InventoryAlerts />
        </div>
      </div>

      <div className="flex mt-6 gap-6">
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
