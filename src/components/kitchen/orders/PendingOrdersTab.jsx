import OrderCard from "../OrderCard";
import { useState, useEffect } from "react";
import { getOrderCardsAPI } from "../../../apis/kitchen/orders";
import { toast } from "react-toastify";

const PendingOrdersTab = ({ handleOrderClick, selectedOrderId, refreshKey }) => {
  const [pendingOrdersDetails, setPendingOrdersDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingOrdersDetails = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const { data, error } = await getOrderCardsAPI("PENDING");
    if (error) {
      toast.error("Error fetching pending orders");
    } else if (data) {
      setPendingOrdersDetails(data);
    }
    if (showLoading) setLoading(false);
  };

  // Initial mount: show full loading state (list is empty)
  useEffect(() => {
    fetchPendingOrdersDetails(true);
  }, []);

  // WebSocket refresh: background fetch — existing orders stay visible, no flash
  useEffect(() => {
    if (refreshKey > 0) fetchPendingOrdersDetails(false);
  }, [refreshKey]);

  if (loading) {
    return (
      <p className="animate-pulse py-8 text-center text-sm font-bold text-orange-400">
        Loading Pending Orders...
      </p>
    );
  }

  //when no pending orders found show this message
  if (pendingOrdersDetails.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-300">
        No pending orders right now
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {pendingOrdersDetails.map((order) => (
        <OrderCard
          key={order.id}
          status={order.status}
          time={order.time}
          id={order.orderNumber}
          numberOfItems={order.itemCount}
          onClick={() => handleOrderClick(order.id)}
          isSelected={order.id === selectedOrderId}
        />
      ))}
    </div>
  );
};

export default PendingOrdersTab;
