import React from 'react'
import OrderCard from '../OrderCard'
import { getOrdersAPI } from '../../../apis/kitchen/dashboard';
import { useState, useEffect } from "react";

// const pendingOrdersData = [
//   { status: "Pending", time: "10:45 AM", id: "#ORD-001", items: "3 Items" },
//   { status: "Pending", time: "10:50 AM", id: "#ORD-002", items: "1 Items" },
//   { status: "Pending", time: "10:55 AM", id: "#ORD-003", items: "5 Items" },
// ];

  //   status: "Pending",
  //   time: "10:50 AM",
  //   id: "#ORD-002",
  //   itemCount: 1,
  // },
const PendingOrders = () => {

    const [pendingOrdersDetails, setPendingOrdersDetails] = useState([]);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      const fetchPendingOrdersDetails = async () => {
        //enable loading
        setLoading(true);
        //api call
        const { data, error } = await getOrdersAPI("Pending", 3);
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
    <>
      <h2 className="text-xl font-bold text-gray-800">Pending Orders</h2>
      <div className="flex flex-col gap-3">
        {pendingOrdersDetails.map((order) => (
          <OrderCard
            key={order.id}
            status={order.status}
            time={order.time}
            id={order.id}
            numberOfItems={order.itemCount}
            isClickable={false}
          />
        ))}
      </div>
    </>
  );
};

export default PendingOrders