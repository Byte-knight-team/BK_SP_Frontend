import OrderCard from "../OrderCard";
import { useState, useEffect } from "react";
import { getOrderCardsAPI } from "../../../apis/kitchen/orders";

const CompletedOrdersTab = ({ handleOrderClick }) => {
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
        console.error("Error fetching stats details:", error);
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
        Loading...
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
          id={`#ORD-${order.id}`}
          numberOfItems={order.itemCount}
          onClick={() => handleOrderClick(order.id)}
        />
      ))}
    </div>
  );
};

export default CompletedOrdersTab;
