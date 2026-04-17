import React from "react";
import StatCard from "../../components/kitchen/StatCard";
import {
  ClipboardClock,
  CookingPot,
  CircleCheckBig,
  Clock4,
} from "lucide-react";
import KitchenStatBar from "../../components/kitchen/KitchenStatBar";
import { BarChart } from "../../components/kitchen/BarChart";

/**
 * Dataset for the hourly performance bar chart
 * Represents the number of meals prepared during specific time shifts
 */
const graphData = [
  { time: "8AM-10AM", Meals: 90 },
  { time: "10AM-12PM", Meals: 50 },
  { time: "12PM-2PM", Meals: 20 },
  { time: "2PM-4PM", Meals: 10 },
  { time: "4PM-6PM", Meals: 100 },
  { time: "6PM-8PM", Meals: 50 },
  { time: "8PM-10PM", Meals: 10 },
];

const KitchenDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 1. TOP HEADER: Displays title and subtext */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kitchen Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time performance metrics for Crave House</p>
      </div>

      {/* 2. KPI GRID: Displays key statistics using summary cards */}
      <div className="mb-8 mt-6 grid grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value="124"
          icon={<ClipboardClock color="#E64919" size={40} />}
          iconBgColor="bg-orange-50"
        />
        <StatCard
          title="Pending Orders"
          value="12"
          icon={<CookingPot color="#4F83FF" size={40} />}
          iconBgColor="bg-blue-50"
        />
        <StatCard
          title="Completed Orders"
          value="112"
          icon={<CircleCheckBig color="#4CAF50" size={40} />}
          iconBgColor="bg-green-50"
        />
        <StatCard
          title="Average Prep Time"
          value="15 min"
          icon={<Clock4 color="#A855F7" size={40} />}
          iconBgColor="bg-purple-50"
        />
      </div>

      {/* 3. MAIN CONTENT: 3-Column Grid for advanced analytics and alerts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        
        {/* SECTION: POPULAR MEALS - Vertical bars showing best-selling items */}
        <div className="flex flex-col gap-6 border border-gray-100 bg-white p-6 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Most Popular Meals</h2>
            <span className="text-sm font-medium text-gray-400">Past 24 Hours</span>
          </div>
          
          <div className="flex flex-col gap-2">
            <KitchenStatBar label="Mixed Fried Rice" percentage={85} color="#4CAF50" count="45" />
            <KitchenStatBar label="Chicken Kottu" percentage={65} color="#4F83FF" count="32" />
            <KitchenStatBar label="Signature Burger" percentage={45} color="#E64919" count="21" />
            <KitchenStatBar label="Pasta Carbonara" percentage={25} color="#A855F7" count="12" />
          </div>
        </div>

        {/* SECTION: PEAK HOURS - Bar chart visualizing kitchen busy times */}
        <div className="flex flex-col gap-6 border border-gray-100 bg-white p-6 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Peak Hours</h2>
            <span className="text-sm font-medium text-gray-400">Past 24 Hours</span>
          </div>
          
          <div className="flex items-center justify-center mt-2">
            <BarChart
              data={graphData}
              index="time"
              categories={["Meals"]}
              colors={["orange"]}
              showLegend={false}
            />
          </div>
        </div>

        {/* SECTION: INVENTORY ALERTS - Critical warnings for low stock items */}
        <div className="flex flex-col gap-6 border border-gray-100 bg-white p-6 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Inventory Alerts</h2>
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-600">3 Critical</span>
          </div>

          <div className="flex flex-col gap-2">
            <KitchenStatBar
              label="Wagyu Beef (A5)"
              percentage={20}
              color="#EF4444"
              count="4 / 20"
              weight="KG"
              warningLevel="CRITICAL"
            />
            <KitchenStatBar
              label="Maldon Sea Salt"
              percentage={66}
              color="#F59E0B"
              count="2 / 3"
              weight="KG"
              warningLevel="LOW"
            />
            <KitchenStatBar
              label="Truffle Oil"
              percentage={70}
              color="#F59E0B"
              count="2.1 / 3"
              weight="Liters"
              warningLevel="LOW"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default KitchenDashboardPage;