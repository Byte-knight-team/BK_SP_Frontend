import React from "react";
import StatCard from "../../components/receptionist/StatCard";
import PendingOrdersTable from "../../components/receptionist/PendingOrdersTable";
import PaymentStat from "../../components/receptionist/PaymentStat";
import TableStatusCard from "../../components/receptionist/TableStatusCard"; // අලුත් එක Import කරන්න
import {
  ClipboardClock,
  CircleCheckBig,
  CircleDollarSign,
  CircleX,
  TriangleAlert,
} from "lucide-react";

const ReceptionistDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 1. Header Section */}
      <div className="p-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Receptionist Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Real-time performance metrics for Crave House
        </p>
      </div>

      {/* 2. Top Stats Section (Cards 5) */}
      <div className="mt-6 mb-8 grid grid-cols-5 gap-4">
        <StatCard
          title="Pending Orders"
          value="124"
          icon={<ClipboardClock color="#E64919" size={40} />}
          iconBgColor="bg-orange-50"
        />
        <StatCard
          title="Paid Orders"
          value="124"
          icon={<CircleDollarSign color="#4F83FF" size={40} />}
          iconBgColor="bg-blue-50"
        />
        <StatCard
          title="Closed Orders"
          value="124"
          icon={<CircleCheckBig color="#4CAF50" size={40} />}
          iconBgColor="bg-green-50"
        />
        <StatCard
          title="Action Required"
          value="124"
          icon={<TriangleAlert color="#EF4444" size={40} />}
          iconBgColor="bg-red-50"
        />
        <StatCard
          title="Cancelled Orders"
          value="124"
          icon={<CircleX color="#EF4444" size={40} />}
          iconBgColor="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-6">
          <h2 className="border-b border-gray-50 p-6 text-xl font-bold tracking-tight text-gray-900">
            Recent Pending Orders
          </h2>
          <PendingOrdersTable />
        </div>

        <div className="lg:col-span-3">
          <PaymentStat />
        </div>

        <div className="lg:col-span-3">
          <TableStatusCard />
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboardPage;