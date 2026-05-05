import { RiMapPin2Line, RiWalletLine, RiCheckLine, RiCloseLine } from "@remixicon/react";
import { useState } from "react";

export default function OrderActionCard({ order, onAccept, onReject }) {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await onAccept(order.id);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (window.confirm("Are you sure you want to reject this order?")) {
      setLoading(true);
      try {
        await onReject(order.id, "Driver rejected from mobile app");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-4xl p-6 border border-gray-100 shadow-sm space-y-5">
      <div className="flex justify-between items-start">
        <div className="bg-gray-50 px-3 py-1 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {order.orderNumber}
        </div>
        <div className="text-lg font-black text-gray-900">
          Rs. {order.amount.toLocaleString()}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-1 w-5 h-5 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <RiMapPin2Line size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">
              Delivery Location
            </p>
            <p className="text-sm font-bold text-gray-700 truncate">
              {order.location || "Location not provided"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1 w-5 h-5 rounded-md bg-green-50 text-green-500 flex items-center justify-center shrink-0">
            <RiWalletLine size={14} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">
              Payment Method
            </p>
            <p className="text-sm font-bold text-gray-700 uppercase">
              {order.paymentType}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleReject}
          disabled={loading}
          className="flex-1 h-12 rounded-2xl border-2 border-gray-100 text-gray-400 flex items-center justify-center transition-all active:scale-95 hover:bg-red-50 hover:border-red-100 hover:text-red-500 disabled:opacity-50"
        >
          <RiCloseLine size={24} />
        </button>
        <button
          onClick={handleAccept}
          disabled={loading}
          className="flex-3 h-12 rounded-2xl bg-orange-500 text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all active:scale-95 hover:bg-orange-600 disabled:opacity-50"
        >
          <RiCheckLine size={24} />
          Accept Order
        </button>
      </div>
    </div>
  );
}
