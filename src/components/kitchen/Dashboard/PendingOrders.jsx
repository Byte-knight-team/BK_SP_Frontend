import OrderCard from "../OrderCard";
import { getOrderCardsAPI } from "../../../apis/kitchen/dashboard";
import { useState, useEffect } from "react";

const PendingOrders = () => {
      const [pendingOrdersDetails, setPendingOrdersDetails] = useState([]);
      const [loading, setLoading] = useState(false);
    
      useEffect(() => {
        const fetchPendingOrdersDetails = async () => {
          //enable loading
          setLoading(true);
          //api call
          const { data, error } = await getOrderCardsAPI("PENDING");
          //handle error
          if (error) {
            console.error("Error fetching stats details:", error);
            return;
          }
          //handle success
          if (data) {
            setPendingOrdersDetails(data);
          }
          //disable loading
          setLoading(false);
        };
    
        fetchPendingOrdersDetails();
      }, []);
    
      // When loading show 3 skeleton components
      if (loading) {
        return (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex h-[120px] w-full animate-pulse items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/50"
              >
                <span className="text-xs font-medium text-gray-300">
                  Loading Order...
                </span>
              </div>
            ))}
          </div>
        );
      }

  return (
    <>
      <h2 className="text-xl font-bold text-gray-800">Pending Orders</h2>
      <div className="flex flex-col gap-3 h-[380px] overflow-y-auto pr-2">
        {pendingOrdersDetails.map((order) => (
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

export default PendingOrders
