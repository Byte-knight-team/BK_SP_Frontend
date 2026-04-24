import OrderCard from "../OrderCard";
import { useState, useEffect } from "react";
import { getOrderCardsAPI } from "../../../apis/kitchen/orders";

const PendingOrdersTab = ({ handleOrderClick }) => {
  const [pendingOrdersDetails, setPendingOrdersDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPendingOrdersDetails = async () => {
      setLoading(true);
      const { data, error } = await getOrderCardsAPI("PENDING");
      if (error) {
        console.error("Error fetching pending orders:", error);
        return;
      }
      if (data) {
        setPendingOrdersDetails(data);
      }
      setLoading(false);
    };

    fetchPendingOrdersDetails();
  }, []);

  if (loading) {
    return (
      <p className="animate-pulse py-8 text-center text-sm font-bold text-orange-400">
        Loading...
      </p>
    );
  }

  if (pendingOrdersDetails.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-300">
        No pending orders right now
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {pendingOrdersDetails.map((order) => (
        <OrderCard
          key={order.id}
          status={order.status}
          time={order.time}
          id={`#ORD-${order.id}`}
          numberOfItems={order.itemCount}
          onClick={() => handleOrderClick(order.id)}
        />
      ))}
    </div>
  );
};

export default PendingOrdersTab;
