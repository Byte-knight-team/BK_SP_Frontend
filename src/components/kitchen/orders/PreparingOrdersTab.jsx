import OrderCard from "../OrderCard";
import { useState, useEffect } from "react";
import { getOrdersAPI } from "../../../apis/kitchen/orders";

const PreparingOrdersTab = ({ handleOrderClick }) => { //{} is used to destructure the props. it is required
  
    const [preparingOrdersDetails, setPreparingOrdersDetails] = useState([]);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      const fetchPreparingOrdersDetails = async () => {
        //enable loading
        setLoading(true);
        //api call
        const { data, error } = await getOrdersAPI("Preparing", null);
        //handle error
        if (error) {
          console.error("Error fetching stats details:", error);
          return;
        }
        //handle success
        if (data) {
          //const formattedData = formatOrdersDetails(data);
          //setPendingOrdersDetails(formattedData);
          setPreparingOrdersDetails(data);
        }
        //disable loading
        setLoading(false);
      };
  
      fetchPreparingOrdersDetails();
    }, []);
  
    if (loading) {
      return <div>Loading...</div>;
    }
    
  return (
    <div className="flex flex-col gap-6">
      {preparingOrdersDetails.map((order) => (
        <OrderCard
          key={order.id}
          status="Preparing"
          time={order.time}
          id={order.id}
          numberOfItems={order.itemCount}
          onClick={() => handleOrderClick(order.id)}
        />
      ))}
    </div>
  );
};

export default PreparingOrdersTab;
