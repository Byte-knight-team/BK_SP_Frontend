import OrderCard from "../OrderCard";
import { useState, useEffect } from "react";
import { getOrderCardsAPI } from "../../../apis/kitchen/orders";

const PreparingOrdersTab = ({ handleOrderClick }) => { //{} is used to destructure the props. it is required

    const [preparingOrdersDetails, setPreparingOrdersDetails] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const fetchPreparingOrdersDetails = async () => {
        //enable loading
        setLoading(true);
        //api call
        const { data, error } = await getOrderCardsAPI("PREPARING");
        //handle error
        if (error) {
          console.error("Error fetching stats details:", error);
          return;
        }
        //handle success
        if (data) {
          setPreparingOrdersDetails(data);
        }
        //disable loading
        setLoading(false);
      };
  
      fetchPreparingOrdersDetails();
    }, []);
  
    if (loading) {
    return <p className="py-8 text-center text-sm font-bold text-orange-400 animate-pulse">Loading...</p>;
  }

  if (preparingOrdersDetails.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-300">No preparing orders right now</p>;
  }
    
  return (
    <div className="flex flex-col gap-6">
      {preparingOrdersDetails.map((order) => (
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

export default PreparingOrdersTab;
