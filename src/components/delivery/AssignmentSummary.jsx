import { RiMapPin2Line, RiTruckLine } from "@remixicon/react";

export default function AssignmentSummary({ count }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
          <RiTruckLine size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Assigned Tasks
          </h4>
          <p className="text-2xl font-black text-gray-900">
            {count} <span className="text-sm font-medium text-gray-400">Orders</span>
          </p>
        </div>
      </div>
      
      <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
        Pending
      </div>
    </div>
  );
}
