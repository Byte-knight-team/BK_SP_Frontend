import { useState, useEffect } from "react";
import OrderStepper from "../OrderStepper";
import MealTable from "./MealTable";
import { AlertCircle } from "lucide-react";
import AssignChefModal from "./AssignChefModal";
import HoldOrderModal from "./HoldOrderModal";
import ActionConfirmationModal from "./ActionConfirmationModal";
import {
  getOrderDetailsAPI,
  assignChefToMealAPI,
  holdOrderAPI,
  startMealAPI,
  completeMealAPI,
} from "../../../apis/kitchen/orders";

const statusLabels = {
  PENDING: "Placed on",
  PREPARING: "Preparing started at",
  COMPLETED: "Completed at",
  ON_HOLD: "Hold at",
};

const statusColors = {
  PENDING: "bg-orange-50 text-orange-500",
  PREPARING: "bg-blue-50 text-blue-500",
  COMPLETED: "bg-green-50 text-green-500",
  ON_HOLD: "bg-red-50 text-red-600",
};

const SelectedOrder = ({ orderId, setActiveTab }) => {

  const [order, setOrder] = useState(null); // Stores the fully formatted order data
  const [loading, setLoading] = useState(false); // Controls the loading state UI
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls the Chef Modal visibility
  const [targetMeal, setTargetMeal] = useState(null); // Remembers which meal is currently being assigned
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false); //Controls the Hold Modal visibility
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // Stores "START" or "COMPLETE"

  // Fetches the latest data from the Backend API (whenever orderId changes or we can call it manually right after the chef is assigned successfully)
  const fetchOrderDetails = async (showLoading = true) => {
    if (!orderId) return;
    if (showLoading) setLoading(true); // Only show loading text if requested
    const { data, error } = await getOrderDetailsAPI(orderId);
    if (error) {
      console.error("Error fetching order details:", error);
    } else if (data) {
      // Map backend data to local state structure
      setOrder({
        id: `#ORD-${data.id}`,
        time: new Date(data.statusUpdatedAt || data.createdAt).toLocaleString(),
        status: data.status,
        holdReason: data.holdReason || "",
        kitchenNote: data.kitchenNotes || "",
        meals: data.items.map((item) => ({
          id: item.id,
          name: item.itemName,
          qty: item.quantity,
          status: item.status,
          chefName: item.assignedChefName || "Not Assigned",
        })),
      });
    }
    setLoading(false);
    return data?.status; // return order status to update the tab
  };

  useEffect(() => {
    fetchOrderDetails(true);
  }, [orderId]);

  // Handler for when the AssignChefModal returns a selected Chef ID
  const handleChefAssignment = async (chefStaffId) => {
    if (!targetMeal) return;

    // Send the assignment to the Backend database
    const { error } = await assignChefToMealAPI(targetMeal.id, chefStaffId);

    if (error) {
      alert("Failed to assign chef.");
    } else {
      // Close modal on success
      setIsModalOpen(false);
      // REFRESH ONLY: Fetches data again to update the UI without reloading the whole page
      fetchOrderDetails(false); // set to false to prevent showing loading screen again (background fetch)
    }
  };

  // Triggered when "Assign Chef" button inside the MealTable is clicked
  const handleAssignChef = (meal) => {
    setTargetMeal(meal); // store the meal that needs to be assigned
    setIsModalOpen(true); // open the modal
  };

  // calls the Hold API and then calls fetchOrderDetails(false) to update silently.
  const handleHoldOrder = async (reason) => {
    const { error } = await holdOrderAPI(orderId, reason);

    if (!error) {
      alert("Order put on hold successfully.");
      setIsHoldModalOpen(false); // Close the modal
      fetchOrderDetails(false); // This is the background fetch! (No loading screen)
      // Switch to On Hold tab (Tab ID is 4)
      setActiveTab(4);
    } else {
      alert("Failed to hold order. Please try again.");
    }
  };

  const handleStartMeal = (meal) => {
    setTargetMeal(meal);
    setActionType("START");
    setIsActionModalOpen(true);
  };

  const handleCompleteMeal = (meal) => {
    setTargetMeal(meal);
    setActionType("COMPLETE");
    setIsActionModalOpen(true);
  };

  const confirmMealAction = async () => {
  if (!targetMeal) return;

  if (actionType === "START") {
    // Call the Start API
    const { error } = await startMealAPI(targetMeal.id);
    
    // If it works, do the success logic for START
    if (!error) {
      setActiveTab(2);             // Switch to Preparing tab
      setIsActionModalOpen(false); // Close modal
      fetchOrderDetails(false);    // Background refresh
    } else {
      alert("Failed to start meal. Please try again.");
    }
    
  } else {
    // Call the Complete API and we get the order stataus immediately
    const { data, error } = await completeMealAPI(targetMeal.id);

    if (!error) {
      setIsActionModalOpen(false); // Close modal
      fetchOrderDetails(false); // Background refresh
      //if the backend returns the final order status as complete, then switch to the completed tab
      if (data && data.orderStatus === "COMPLETED") {
        setActiveTab(3); // Switch to Completed tab (Tab ID is 3)
      }
    } else {
      alert("Failed to complete meal. Please try again.");
    }
  }
};

  // State Management: If data is loading, show animation
  if (loading)
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="animate-pulse text-lg font-bold text-orange-400">
          Loading Order Details...
        </p>
      </div>
    );
  // State Management: If no order is selected yet
  if (!order)
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-gray-400 italic">
          Select an order from the list to view details.
        </p>
      </div>
    );

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5">
      {/* header section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Order {order.id}</h1>
          <p className="mt-1 text-sm font-medium text-gray-400">
            {statusLabels[order.status] || "Updated at"} {order.time}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* order status badge */}
          <span
            className={`rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase ${
              statusColors[order.status] || "bg-gray-50 text-gray-500"
            }`}
          >
            {order.status}
          </span>

          {/* display hold the order button (when order is pending) */}
          {order.status === "PENDING" && (
            <button
              onClick={() => setIsHoldModalOpen(true)} // This opens the modal
              className="flex items-center gap-1 rounded-full border border-red-100 px-4 py-1.5 text-[10px] font-bold text-red-500 transition-all hover:bg-red-50"
            >
              <AlertCircle size={18} /> Hold Order
            </button>
          )}
        </div>
      </div>

      {/* stepper logic */}
      <div className="mt-4">
        {order.status === "ON_HOLD" ? (
          <div className="flex items-start gap-4 rounded-2xl border border-red-100 bg-red-50 p-6">
            <AlertCircle size={24} className="mt-0.5 text-red-500" />
            <div>
              <h3 className="font-bold text-red-800">Awaiting Action</h3>
              <p className="mt-1 text-xs text-red-500">
                Reason: {order.holdReason || "Not specified"}
              </p>
            </div>
          </div>
        ) : (
          <OrderStepper status={order.status} />
        )}
      </div>

      {/* kitchen note section for the whole order */}
      {order.kitchenNote && (
        <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-left shadow-sm">
          <p className="text-sm font-medium text-orange-800">
            <span className="mr-2 text-xs font-bold tracking-wider text-orange-500 uppercase">
              Note:
            </span>
            {order.kitchenNote}
          </p>
        </div>
      )}

      {/* table section */}
      <div className="mt-5">
        <MealTable
          mealsData={order.meals}
          orderStatus={order.status}
          onAssignChef={handleAssignChef}
          onStartMeal={handleStartMeal}
          onCompleteMeal={handleCompleteMeal}
        />
      </div>

      {/* assign chef modal */}
      <AssignChefModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssign={handleChefAssignment}
        // Passes the name of the selected meal to the Modal.
        // The '?.' (Optional Chaining) ensures the app doesn't crash if no meal is selected yet.
        mealName={targetMeal?.name}
      />

      {/* Hold Order Modal */}
      <HoldOrderModal
        isOpen={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
        onConfirm={handleHoldOrder} // Connects to the handler above
      />

      {/* Action Confirmation Modal */}
      <ActionConfirmationModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onConfirm={confirmMealAction}
        type={actionType}
        mealName={targetMeal?.name}
        chefName={targetMeal?.chefName}
      />
    </div>
  );
};

export default SelectedOrder;
