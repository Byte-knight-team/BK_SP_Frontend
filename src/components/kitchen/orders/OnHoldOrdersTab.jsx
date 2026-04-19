import OrderCard from "../OrderCard";
import { useState, useEffect } from "react";
import { getOrdersAPI } from "../../../apis/kitchen/orders";

const OnHoldOrdersTab = ({handleOrderClick}) => {
  const [onHoldOrdersDetails, setOnHoldOrdersDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOnHoldOrdersDetails = async () => {
      //enable loading
      setLoading(true);
      //api call
      const { data, error } = await getOrdersAPI("On Hold", null);
      //handle error
      if (error) {
        console.error("Error fetching stats details:", error);
        return;
      }
      //handle success
      if (data) {
        //const formattedData = formatOrdersDetails(data);
        //setPendingOrdersDetails(formattedData);
        setOnHoldOrdersDetails(data);
      }
      //disable loading
      setLoading(false);
    };

    fetchOnHoldOrdersDetails();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {onHoldOrdersDetails.map((order) => (
        <OrderCard
          key={order.id}
          status="On Hold"
          time={order.time}
          id={order.id}
          numberOfItems={order.itemCount}
          onClick={() => handleOrderClick(order.id)}
        />
      ))}
    </div>
  );
};

export default OnHoldOrdersTab;
