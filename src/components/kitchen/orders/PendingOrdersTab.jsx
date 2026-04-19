import OrderCard from "../OrderCard";
import { useState, useEffect } from "react";
import { getOrdersAPI } from "../../../apis/kitchen/orders";

const PendingOrdersTab = ({ handleOrderClick }) => {
  //destructuring the handleOrderClick method from the parent component

  const [pendingOrdersDetails, setPendingOrdersDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPendingOrdersDetails = async () => {
      //enable loading
      setLoading(true);
      //api call
      const { data, error } = await getOrdersAPI("Pending", null);
      //handle error
      if (error) {
        console.error("Error fetching stats details:", error);
        return;
      }
      //handle success
      if (data) {
        //const formattedData = formatOrdersDetails(data);
        //setPendingOrdersDetails(formattedData);
        setPendingOrdersDetails(data);
      }
      //disable loading
      setLoading(false);
    };

    fetchPendingOrdersDetails();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {pendingOrdersDetails.map((order) => (
        <OrderCard
          key={order.id}
          status="Pending"
          time={order.time}
          id={order.id}
          numberOfItems={order.itemCount}
          onClick={() => handleOrderClick(order.id)} //pass data to the parent component
        />
      ))}
    </div>
  );
};

export default PendingOrdersTab;
