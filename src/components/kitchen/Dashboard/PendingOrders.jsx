import OrderCard from "../OrderCard";
import { getOrderCardsAPI } from "../../../apis/kitchen/dashboard";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

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
            toast.error("Error fetching pending orders details");
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
      <h2 className="text-base font-bold text-gray-800">Pending Orders</h2>
      <div className="flex flex-col gap-2 h-[300px] overflow-y-auto pr-2">
        {pendingOrdersDetails.map((order) => (
          <OrderCard
            key={order.id}
            status={order.status}
            time={order.time}
            id={`#ORD-${order.id}`} // Hardcoded prefix
            numberOfItems={order.itemCount}
            //by default order card is clickable, but here we are making it unclickable
            isClickable={false}
          />
        ))}
      </div>
    </>
  );
};

export default PendingOrders
