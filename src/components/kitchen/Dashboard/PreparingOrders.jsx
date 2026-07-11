import OrderCard from '../OrderCard'
import { getOrderCardsAPI } from '../../../apis/kitchen/dashboard';
import { useState, useEffect } from "react";
import { CookingPot } from "lucide-react";
import { toast } from "react-toastify";

const PreparingOrders = () => {
      const [preparingOrdersDetails, setPreparingOrdersDetails] = useState([]);
      const [loading, setLoading] = useState(false);
    
      useEffect(() => {
        const fetchPreparingOrdersDetails = async () => {
          //enable loading
          setLoading(true);
          //api call
          const { data, error } = await getOrderCardsAPI("PREPARING");
          //handle error
          if (error) {
            toast.error("Error fetching preparing orders details");
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
        <div className="flex items-center justify-center rounded-xl bg-blue-50 p-2">
          <CookingPot size={18} className="text-blue-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-800">Preparing Orders</h2>
          <p className="text-xs text-gray-400">Currently being cooked</p>
        </div>
      </div>

      {preparingOrdersDetails.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 py-6 text-gray-300">
          <CookingPot size={32} strokeWidth={1.2} />
          <p className="text-xs font-medium">Nothing cooking right now</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-2 min-h-0">
          {preparingOrdersDetails.map((order) => (
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

export default PreparingOrders