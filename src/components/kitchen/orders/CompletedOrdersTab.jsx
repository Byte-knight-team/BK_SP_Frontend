import OrderCard from "../OrderCard";
import { useState, useEffect } from "react";
import { getOrderCardsAPI } from "../../../apis/kitchen/orders";
import { toast } from "react-toastify";

const CompletedOrdersTab = ({ handleOrderClick, selectedOrderId }) => {
  const [completedOrdersDetails, setCompletedOrdersDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCompletedOrdersDetails = async () => {
      //enable loading
      setLoading(true);
      //api call
      const { data, error } = await getOrderCardsAPI("COMPLETED");
      //handle error
      if (error) {
        toast.error("Error fetching completed orders");
        return;
      }
      //handle success
      if (data) {
        setCompletedOrdersDetails(data);
      }
      //disable loading
      setLoading(false);
    };

    fetchCompletedOrdersDetails();
  }, []);

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
    <div className="flex flex-col gap-6">
      {completedOrdersDetails.map((order) => (
        <OrderCard
          key={order.id}
          status={order.status}
          time={order.time}
          id={order.orderNumber}
          numberOfItems={order.itemCount}
          onClick={() => handleOrderClick(order.id)}
          //if the order is already selected, highlight it
          isSelected={order.id === selectedOrderId}
        />
      ))}
    </div>
  );
};

export default CompletedOrdersTab;
