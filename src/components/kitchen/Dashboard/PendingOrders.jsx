import OrderCard from "../OrderCard";
import { getOrderCardsAPI } from "../../../apis/kitchen/dashboard";
import { useState, useEffect } from "react";
import { ClipboardClock } from "lucide-react";
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
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex items-center justify-center rounded-xl bg-orange-50 p-2">
          <ClipboardClock size={18} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-800">Pending Orders</h2>
          <p className="text-xs text-gray-400">Waiting to be prepared</p>
        </div>
      </div>

      {pendingOrdersDetails.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 py-6 text-gray-300">
          <ClipboardClock size={32} strokeWidth={1.2} />
          <p className="text-xs font-medium">No pending orders</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-2 min-h-0">
          {pendingOrdersDetails.map((order) => (
            <OrderCard
              key={order.id}
              status={order.status}
              time={order.time}
              id={order.orderNumber}
              numberOfItems={order.itemCount}
              //by default order card is clickable, but here we are making it unclickable
              isClickable={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingOrders
