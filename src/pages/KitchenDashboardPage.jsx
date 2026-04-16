import React from "react";
import StatCard from "../components/StatCard";
import { PageHeader } from "../components/layouts/pageHeader/PageHeader";
import { ClipboardClock, CookingPot, CircleCheckBig, Clock4 } from "lucide-react";

export const KitchenDashboardPage = () => {
  return (
    <div className="mt-6 mb-6 ml-4 mr-4 ">
      <PageHeader
        title="Kitchen Dashboard Overview"
        description="Real-time performance metrics for Crave House"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Orders" value="124" icon={<ClipboardClock color="#E64919" size={40} />} iconBgColor="bg-orange-50" />
        <StatCard title="Pending Orders" value="12" icon={<CookingPot color="#4F83FF" size={40} />} iconBgColor="bg-blue-50" />
        <StatCard title="Completed Orders" value="112" icon={<CircleCheckBig color="#4CAF50" size={40} />} iconBgColor="bg-green-50" />
        <StatCard title="Average Prep Time" value="15 min" icon={<Clock4 color="#A855F7" size={40} />} iconBgColor="bg-purple-50" />
      </div>
      <div className="flex flex-row gap-4">
        <dev className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          most wanted meals
        </dev>
        <dev className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          peak hours
        </dev>
        <dev className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          low inventory
        </dev>
      </div>
    </div>
  );
};
