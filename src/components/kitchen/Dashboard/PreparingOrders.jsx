import React from 'react'
import OrderCard from '../OrderCard'
import { getOrdersAPI } from '../../../apis/kitchen/dashboard';
import { useState, useEffect } from "react";

const PreparingOrders = () => {
      const [preparingOrdersDetails, setPreparingOrdersDetails] = useState([]);
      const [loading, setLoading] = useState(false);
    
      useEffect(() => {
        const fetchPreparingOrdersDetails = async () => {
          //enable loading
          setLoading(true);
          //api call
          const { data, error } = await getOrdersAPI("PREPARING");
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
        return <div>Loading...</div>;
      }
  return (
    <>
      <h2 className="text-xl font-bold text-gray-800">Preparing Orders</h2>
      <div className="flex flex-col gap-3 h-[380px] overflow-y-auto pr-2">
        {preparingOrdersDetails.map((order) => (
          <OrderCard
            key={order.id}
            status={order.status}
            time={order.time}
            id={`#ORD-${order.id}`} // Hardcoded prefix
            numberOfItems={order.itemCount}
            isClickable={false}
          />
        ))}
      </div>
    </>
  );
};

export default PreparingOrders