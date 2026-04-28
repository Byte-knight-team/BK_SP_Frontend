import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RiArrowLeftSLine, RiMapPin2Line, RiPhoneLine, RiTruckLine, RiCheckDoubleLine, RiFileList3Line } from "@remixicon/react";
import { DeliveryService } from "../../apis/delivery/DeliveryService";

export default function DeliveryOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      // For now, using getActiveOrder or a new detail endpoint
      // To keep it simple for Phase 1, we'll fetch from active order
      const response = await DeliveryService.getActiveOrder();
      if (response.data && response.data.id.toString() === id) {
        setOrder(response.data);
      } else {
        // If not the active one, maybe it was just completed or rejected
        navigate("/delivery/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await DeliveryService.updateDeliveryStatus(id, status);
      if (status === "DELIVERED") {
        navigate("/delivery/dashboard");
      } else {
        fetchOrderDetails();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>;

  return (
    <div className="space-y-6 max-w-md mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 active:scale-90 transition-transform"
        >
          <RiArrowLeftSLine size={24} />
        </button>
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
          Delivery Task
        </h2>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-4xl p-6 border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-gray-50 pb-4">
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">
              Order ID
            </p>
            <h3 className="text-lg font-black text-gray-900">{order.orderNumber}</h3>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
            order.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'
          }`}>
            {order.status.replace(/_/g, ' ')}
          </div>
        </div>

        {/* Address & Contact */}
        <div className="space-y-5">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <RiMapPin2Line size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">
                Deliver to
              </p>
              <p className="text-sm font-bold text-gray-700 leading-relaxed">
                {order.location}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center shrink-0">
              <RiPhoneLine size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">
                Contact Customer
              </p>
              <p className="text-sm font-bold text-gray-700 underline">
                +94 77 123 4567
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-3xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RiFileList3Line className="text-gray-400" size={20} />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Total Amount
            </span>
          </div>
          <span className="text-lg font-black text-gray-900">
            Rs. {order.amount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4">
        {order.status === "ACCEPTED" ? (
          <button
            onClick={() => updateStatus("OUT_FOR_DELIVERY")}
            disabled={updating}
            className="w-full h-16 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-black/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <RiTruckLine size={24} />
            Start Delivery
          </button>
        ) : order.status === "OUT_FOR_DELIVERY" ? (
          <button
            onClick={() => updateStatus("DELIVERED")}
            disabled={updating}
            className="w-full h-16 rounded-2xl bg-green-500 text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-green-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <RiCheckDoubleLine size={24} />
            Mark as Delivered
          </button>
        ) : null}
      </div>
    </div>
  );
}
