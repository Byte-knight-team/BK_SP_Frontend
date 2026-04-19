import React from 'react'
import OrderCard from '../OrderCard'
import { getOrdersAPI } from '../../../apis/kitchen/dashboard';
import { useState, useEffect } from "react";

// const preparingOrdersData = [
//   { status: "Preparing", time: "10:30 AM", id: "#ORD-995", items: "2 Items" },
//   { status: "Preparing", time: "10:35 AM", id: "#ORD-996", items: "4 Items" },
//   { status: "Preparing", time: "10:38 AM", id: "#ORD-997", items: "1 Item" },
// ];

const PreparingOrders = () => {
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
    <>
      <h2 className="text-xl font-bold text-gray-800">New Preparing Orders</h2>
      <div className="flex flex-col gap-3 h-[380px] overflow-y-auto pr-2">
        {preparingOrdersDetails.map((order) => (
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

export default PreparingOrders

//