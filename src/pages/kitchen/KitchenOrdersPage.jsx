import { RiClipboardLine } from "@remixicon/react";
import OrderTabs from "../../components/kitchen/orders/OrderTabs";
import SelectedOrder from "../../components/kitchen/orders/SelectedOrder";
import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ClipboardList } from "lucide-react";
import useWebSocket from "../../hooks/useWebSocket";
import { getOrderCardsAPI } from "../../apis/kitchen/orders";

const KitchenOrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null); // Tracks which order is currently selected in the left panel
  const { setHeaderInfo } = useOutletContext();
  const [activeTab, setActiveTab] = useState(1); // When the page loads, the Pending tab (id: 1) is active by default

  // Used to trigger a refresh of the pending orders list when a new order arrives
  const [pendingRefreshKey, setPendingRefreshKey] = useState(0)

  // Used to trigger a silent refresh of the selected order detail when a line chef updates an item
  const [itemUpdateKey, setItemUpdateKey] = useState(0)

  const { user } = useAuth()
  const branchId = user?.branchId

  // Per-tab counts shown as badges, plus the blinking dot on Pending when > 0.
  const [counts, setCounts] = useState({ pending: 0, preparing: 0, completed: 0, onHold: 0 })

  const fetchCounts = useCallback(async () => {
    const [pending, preparing, completed, onHold] = await Promise.all([
      getOrderCardsAPI("PENDING"),
      getOrderCardsAPI("PREPARING"),
      getOrderCardsAPI("COMPLETED"),
      getOrderCardsAPI("ON_HOLD"),
    ])
    setCounts({
      pending: pending.data?.length ?? 0,
      preparing: preparing.data?.length ?? 0,
      completed: completed.data?.length ?? 0,
      onHold: onHold.data?.length ?? 0,
    })
  }, [])

  useEffect(() => {
    setHeaderInfo({
      title: "Order Management",
      description: "Monitor and manage your kitchen orders in real-time.",
      Icon: RiClipboardLine,
    });
  }, []);

  useEffect(() => { fetchCounts() }, [fetchCounts])

  // Called when a new order notification arrives from the receptionist via WebSocket
  const handleNewOrder = useCallback(() => {
    // Toast is shown globally by KitchenNotifier; here we only refresh the pending list in the
    // background — do NOT switch tabs, the chef may be actively working on a different section.
    setPendingRefreshKey((prev) => prev + 1)
    fetchCounts()
  }, [fetchCounts])

  // Subscribe to the kitchen-orders topic for this branch
  const kitchenOrderTopic = branchId
    ? `/topic/branch/${branchId}/kitchen-orders`
    : null

  useWebSocket(branchId, kitchenOrderTopic, handleNewOrder)

  // Subscribe to item-level updates from line chefs (start/complete)
  const kitchenItemUpdateTopic = branchId
    ? `/topic/branch/${branchId}/kitchen-item-update`
    : null

  const handleItemUpdate = useCallback(() => {
    // Toasts are shown globally by KitchenNotifier; here we only refresh the lists.
    setItemUpdateKey((prev) => prev + 1)
    setPendingRefreshKey((prev) => prev + 1)
    fetchCounts()
  }, [fetchCounts])

  useWebSocket(branchId, kitchenItemUpdateTopic, handleItemUpdate)


  return (
    <div className="flex h-[calc(100vh-80px)] gap-4 p-0">

      {/* Left panel — order list with tab switcher */}
      <div className="flex w-96 shrink-0 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <OrderTabs
          handleOrderClick={(id) => setSelectedOrder(id)}
          selectedOrderId={selectedOrder}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingRefreshKey={pendingRefreshKey}
          itemUpdateKey={itemUpdateKey}
          counts={counts}
        />
      </div>

      {/* Right panel — full detail of the selected order */}
      <div className="flex-1 overflow-y-auto">
        {selectedOrder ? (
          <SelectedOrder orderId={selectedOrder} setActiveTab={setActiveTab} refreshKey={itemUpdateKey} onCountsChange={fetchCounts} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-3xl border border-gray-100 bg-white">
            <div className="rounded-2xl bg-orange-50 p-5 text-orange-300">
              <ClipboardList size={32} />
            </div>
            <p className="text-sm font-bold text-gray-400">Select an order to view details</p>
            <p className="text-xs text-gray-300">Click any order from the list on the left</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default KitchenOrdersPage;
