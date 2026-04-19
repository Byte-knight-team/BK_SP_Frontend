import OrderCard from "./OrderCard";
import { useState, useEffect } from "react";

const pendingOrderResponse = [
  {
    orderId: "#ORD-12345",
    time: "10:00 AM",
    numberOfItems: "3 Items",
  },
  {
    orderId: "#ORD-12346",
    time: "10:00 AM",
    numberOfItems: "3 Items",
  },
  {
    orderId: "#ORD-12347",
    time: "10:00 AM",
    numberOfItems: "3 Items",
  },
  {
    orderId: "#ORD-12348",
    time: "10:00 AM",
    numberOfItems: "3 Items",
  },
  {
    orderId: "#ORD-12349",
    time: "10:00 AM",
    numberOfItems: "3 Items",
  },
];

const PendingOrdersTab = ({ handleOrderClick }) => { //destructuring the handleOrderClick method from the parent component
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        // todo: fetch pending orders from API
        setPendingOrders(pendingOrderResponse);
      } catch (error) {
        console.error("Error fetching graph data:", error);
      }
    };
    fetchPendingOrders();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {pendingOrders.map((order) => (
        <OrderCard
          key={order.orderId}
          status="Pending"
          time={order.time}
          id={order.orderId}
          numberOfItems={order.numberOfItems}
          onClick={() => handleOrderClick(order.orderId)} //
        />
      ))}
    </div>
  );
};

export default PendingOrdersTab;
