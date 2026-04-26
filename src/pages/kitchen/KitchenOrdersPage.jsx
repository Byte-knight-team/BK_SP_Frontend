import { RiClipboardLine } from "@remixicon/react";
import OrderTabs from "../../components/kitchen/orders/OrderTabs";
import SelectedOrder from "../../components/kitchen/orders/SelectedOrder";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { ClipboardList } from "lucide-react";

const KitchenOrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { setHeaderInfo } = useOutletContext();

  useEffect(() => {
    setHeaderInfo({
      title: "Order Management",
      description: "Monitor and manage your kitchen orders in real-time.",
      Icon: RiClipboardLine,
    });
  }, []);

  const handleOrderClick = (orderId) => {
    setSelectedOrder(orderId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-row gap-6">
        {/* Order List */}
        <div className="w-[30%] rounded-3xl border border-gray-100 bg-white p-6 shadow-sm h-[82vh] overflow-y-auto">
          
          {/* Pass the selection handler and the current selected ID down to the tabs for highlighting */}
          <OrderTabs handleOrderClick={handleOrderClick} selectedOrderId={selectedOrder}/>
        </div>
        {/* Order Details */}
        <div className="w-[70%] rounded-3xl border border-gray-100 bg-white p-6 shadow-sm h-[82vh] overflow-y-auto">
          {selectedOrder ? (
            <SelectedOrder orderId={selectedOrder} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-gray-300">
              <ClipboardList size={64} strokeWidth={1} />
              <p className="text-lg font-bold">Select an order to view details</p>
              <p className="text-sm text-gray-300">Click on any order from the left panel</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KitchenOrdersPage;
