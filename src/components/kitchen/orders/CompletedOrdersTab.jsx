import OrderCard from "../OrderCard";
import { useState, useEffect } from "react";
import { getOrdersAPI } from "../../../apis/kitchen/orders";

const CompletedOrdersTab = ({ handleOrderClick }) => {
      const [completedOrdersDetails, setCompletedOrdersDetails] = useState([]);
      const [loading, setLoading] = useState(false);
    
      useEffect(() => {
        const fetchCompletedOrdersDetails = async () => {
          //enable loading
          setLoading(true);
          //api call
          const { data, error } = await getOrdersAPI("COMPLETED", null);
          //handle error
          if (error) {
            console.error("Error fetching stats details:", error);
            return;
          }
          //handle success
          if (data) {
            //const formattedData = formatOrdersDetails(data);
            //setPendingOrdersDetails(formattedData);
            setCompletedOrdersDetails(data);
          }
          //disable loading
          setLoading(false);
        };
    
        fetchCompletedOrdersDetails();
      }, []);
    
      if (loading) {
        return <div>Loading...</div>;
      }
      
  return (
    <div className="flex flex-col gap-6">
      {completedOrdersDetails.map((order) => (
        <OrderCard
          key={order.id}
          status="COMPLETED"
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
