import OrderCard from "../OrderCard";
import { useState, useEffect } from "react";
import { getOrderCardsAPI } from "../../../apis/kitchen/orders";
import { toast } from "react-toastify";

const CompletedOrdersTab = ({ handleOrderClick, selectedOrderId, refreshKey }) => {
  const [completedOrdersDetails, setCompletedOrdersDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCompletedOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const { data, error } = await getOrderCardsAPI("COMPLETED");
    if (error) toast.error("Error fetching completed orders");
    else if (data) setCompletedOrdersDetails(data);
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    fetchCompletedOrders(true);
  }, []);

  // Silent background refresh — no loading flash, list stays visible while updating
  useEffect(() => {
    if (refreshKey > 0) fetchCompletedOrders(false);
  }, [refreshKey]);

  if (loading) {
    return (
      <p className="animate-pulse py-8 text-center text-sm font-bold text-orange-400">
        Loading Completed Orders...
      </p>
    );
  }

  if (completedOrdersDetails.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-300">
        No completed orders right now
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {completedOrdersDetails.map((order) => (
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

export default CompletedOrdersTab;
