import { useAuth } from "../../context/AuthContext";
import ProfileHeader from "../../components/delivery/ProfileHeader";
import AssignmentSummary from "../../components/delivery/AssignmentSummary";
import OrderActionCard from "../../components/delivery/OrderActionCard";
import { useDeliveryOrders } from "../../hooks/useDeliveryOrders";
import { DeliveryService } from "../../apis/delivery/DeliveryService";

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const { orders, loading, error, refetch } = useDeliveryOrders();

  const handleAccept = async (orderId) => {
    try {
      await DeliveryService.acceptOrder(orderId);
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (orderId, reason) => {
    try {
      await DeliveryService.rejectOrder(orderId, reason);
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
          Loading Tasks...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto pb-8">
      <ProfileHeader name={user?.fullName || user?.username} />
      
      <AssignmentSummary count={orders.length} />

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
            Assigned to you
          </h3>
          {orders.length > 0 && (
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-wider">
              {orders.length} New
            </span>
          )}
        </div>

        {orders.length > 0 ? (
          orders.map((order) => (
            <OrderActionCard
              key={order.id}
              order={order}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))
        ) : (
          <div className="bg-gray-50 rounded-4xl p-12 text-center border-2 border-dashed border-gray-100">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-200 mx-auto mb-4">
              <RiTruckLine size={32} />
            </div>
            <p className="text-sm font-bold text-gray-400">
              No pending assignments.
            </p>
            <p className="text-[10px] text-gray-300 font-medium mt-1">
              New orders will appear here in real-time.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold text-center border border-red-100">
          {error}
        </div>
      )}
    </div>
  );
}

import { RiTruckLine } from "@remixicon/react";
