import OrderCard from "../OrderCard";
import { useState, useEffect } from "react";
import { getOrderCardsAPI } from "../../../apis/kitchen/orders";
import { toast } from "react-toastify";

const PendingOrdersTab = ({ handleOrderClick, selectedOrderId }) => {
  const [pendingOrdersDetails, setPendingOrdersDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPendingOrdersDetails = async () => {
      //enable loading
      setLoading(true);
      const { data, error } = await getOrderCardsAPI("PENDING");
      //handle error
      if (error) {
        //show the error message (toast)
        toast.error("Error fetching pending orders");
        return;
      }
      //handle success
      if (data) {
        setPendingOrdersDetails(data);
      }
      //disable loading
      setLoading(false);
    };

    fetchPendingOrdersDetails();
  }, []);

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
