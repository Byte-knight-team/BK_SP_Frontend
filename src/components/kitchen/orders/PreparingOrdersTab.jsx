import OrderCard from "../OrderCard";
import { useState, useEffect } from "react";
import { getOrderCardsAPI } from "../../../apis/kitchen/orders";
import { toast } from "react-toastify";

const PreparingOrdersTab = ({ handleOrderClick, selectedOrderId, refreshKey }) => {
  const [preparingOrdersDetails, setPreparingOrdersDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPreparingOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const { data, error } = await getOrderCardsAPI("PREPARING");
    if (error) toast.error("Error fetching preparing orders");
    else if (data) setPreparingOrdersDetails(data);
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    fetchPreparingOrders(true);
  }, []);

  // Silent background refresh — no loading flash, list stays visible while updating
  useEffect(() => {
    if (refreshKey > 0) fetchPreparingOrders(false);
  }, [refreshKey]);

  if (loading) {
    return (
      <p className="animate-pulse py-8 text-center text-sm font-bold text-orange-400">
        Loading Preparing Orders...
      </p>
    );
  }

  if (preparingOrdersDetails.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-300">
        No preparing orders right now
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {preparingOrdersDetails.map((order) => (
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

export default PreparingOrdersTab;
