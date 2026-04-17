import { RiClipboardLine } from "@remixicon/react";
import OrderTabs from "../../components/kitchen/OrderTabs";
import { useState } from "react";

const KitchenOrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleOrderClick = (orderId) => {
    setSelectedOrder(orderId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-row items-center gap-2 p-4">
        <div className="rounded-lg bg-orange-50 p-2">
          <RiClipboardLine size={30} color="#E64919" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Order Management
        </h1>
      </div>
      <div className="flex flex-row gap-4">
        <div className="flex-1 rounded-lg bg-white p-4">
          <OrderTabs handleOrderClick={handleOrderClick} />
        </div>
        <div className="flex-1 rounded-lg bg-white p-4">{selectedOrder}</div>
      </div>
    </div>
  );
};

export default KitchenOrdersPage;
