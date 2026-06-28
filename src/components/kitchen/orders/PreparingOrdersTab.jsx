import OrderCard from "../OrderCard";
import { useState, useEffect } from "react";
import { getOrderCardsAPI } from "../../../apis/kitchen/orders";
import { toast } from "react-toastify";

const PreparingOrdersTab = ({ handleOrderClick, selectedOrderId, refreshKey }) => {
    //initialize state variables
    const [preparingOrdersDetails, setPreparingOrdersDetails] = useState([]);
    const [loading, setLoading] = useState(false);

    //useEffect hook to fetch preparing orders
    useEffect(() => {
      //async function to fetch preparing orders
      const fetchPreparingOrdersDetails = async () => {
        //enable loading
        setLoading(true);
        //api call
        const { data, error } = await getOrderCardsAPI("PREPARING");
        //handle error
        if (error) {
          toast.error("Error fetching preparing orders");
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
    }, [refreshKey]);
  
    if (loading) {
      return (
        <p className="animate-pulse py-8 text-center text-sm font-bold text-orange-400">
          Loading Preparing Orders...
        </p>
      );
    }

    if ((preparingOrdersDetails.length === 0)) {
      return (
        <p className="py-8 text-center text-sm text-gray-300">
          No preparing orders right now
        </p>
      );
  }
    
  return (
    <div className="flex flex-col gap-6">
      {preparingOrdersDetails.map((order) => (
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

export default PreparingOrdersTab;
