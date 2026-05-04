import { RiNavigationFill, RiArrowRightSLine } from "@remixicon/react";
import { Link } from "react-router-dom";

export default function ActiveOrderBanner({ order }) {
  if (!order) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 lg:bottom-4 lg:right-4 lg:left-auto lg:w-80 animate-in slide-in-from-bottom-10 duration-500">
      <Link 
        to={`/delivery/orders/${order.id}`}
        className="bg-gray-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-2xl shadow-black/20 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/40 group-active:scale-90 transition-transform">
            <RiNavigationFill size={20} />
          </div>
          <div>
            <div className="text-[10px] text-white/50 font-black uppercase tracking-widest leading-none mb-1">
              Active Delivery
            </div>
            <div className="text-sm font-bold truncate max-w-[120px]">
              {order.orderNumber}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl group-hover:bg-white/20 transition-colors">
          <span className="text-xs font-black uppercase tracking-wider">
            Go to Task
          </span>
          <RiArrowRightSLine size={16} />
        </div>
      </Link>
    </div>
  );
}
