import OrderCard from "../OrderCard";
import { useState, useEffect } from "react";
import { getOrderCardsAPI } from "../../../apis/kitchen/orders";

const OnHoldOrdersTab = ({handleOrderClick}) => {
  const [onHoldOrdersDetails, setOnHoldOrdersDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOnHoldOrdersDetails = async () => {
      //enable loading
      setLoading(true);
      //api call
      const { data, error } = await getOrderCardsAPI("ON_HOLD");
      //handle error
      if (error) {
        console.error("Error fetching stats details:", error);
        return;
      }
      //handle success
      if (data) {
        setOnHoldOrdersDetails(data);
      }
      //disable loading
      setLoading(false);
    };

    fetchOnHoldOrdersDetails();
  }, []);

  if (loading) {
    return <p className="py-8 text-center text-sm font-bold text-orange-400 animate-pulse">Loading...</p>;
  }

  if (onHoldOrdersDetails.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-300">No on hold orders right now</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {onHoldOrdersDetails.map((order) => (
        <OrderCard
          key={order.id}
          status="ON HOLD" //cannot use status={order.status} because backend sends it as "ON_HOLD" not "ON HOLD". 
          time={order.time}
          id={`#ORD-${order.id}`}
          numberOfItems={order.itemCount}
          onClick={() => handleOrderClick(order.id)}
        />
      ))}
    </div>
  );
};

export default OnHoldOrdersTab;
