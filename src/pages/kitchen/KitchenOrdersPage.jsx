import { RiClipboardLine } from "@remixicon/react";
import OrderTabs from "../../components/kitchen/orders/OrderTabs";
import SelectedOrder from "../../components/kitchen/orders/SelectedOrder";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

const KitchenOrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { setHeaderInfo } = useOutletContext();

  useEffect(() => {
    // set the header info for this page
    setHeaderInfo({
      title: "Order Management",
      description: "Monitor and manage your kitchen orders in real-time.",
      Icon: RiClipboardLine,
    });
  }, [setHeaderInfo]);


  const handleOrderClick = (orderId) => {
    setSelectedOrder(orderId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-row gap-4">
        {/*OrderList*/}
          <div className="w-[25%] rounded-lg bg-white p-4 shadow-sm h-[80vh] overflow-y-auto">
          <OrderTabs handleOrderClick={handleOrderClick} />
        </div>
        {/*OrderDetails*/}
        <div className="w-[75%] rounded-lg bg-white p-4 shadow-sm h-[80vh] overflow-y-auto">
          {selectedOrder ? (
            <SelectedOrder orderId={selectedOrder} />
          ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KitchenOrdersPage;
