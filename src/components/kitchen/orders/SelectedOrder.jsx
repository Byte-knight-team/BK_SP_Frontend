import { useState, useEffect } from "react";
import OrderStepper from "../OrderStepper";
import MealTable from "./MealTable";
import { XCircle, AlertCircle } from "lucide-react";
import AssignChefModal from "./AssignChefModal";
import { getOrderDetailsAPI } from "../../../apis/kitchen/orders";

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

const SelectedOrder = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetMeal, setTargetMeal] = useState(null);

  // Fetch real data when orderId changes
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      setLoading(true);
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
            status: item.status || data.status,
            chefName: item.assignedChefName || "Not Assigned",
          })),
        });
      }
      setLoading(false);
    };
    fetchOrderDetails();
  }, [orderId]);

  if (loading)
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="animate-pulse text-lg font-bold text-orange-400">Loading Order Details...</p>
      </div>
    );
  if (!order)
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="italic text-gray-400">Select an order from the list to view details.</p>
      </div>
    );

  const handleAssignChef = (meal) => {
    setTargetMeal(meal);
    setIsModalOpen(true);
  };

  const confirmAssignment = (chefName) => {
    console.log(`Assigning ${chefName} to ${targetMeal?.name}`);
  };

  const handleStartMeal = (mealId) => {
    console.log(`API Call: Starting Meal ${mealId}`);
  };

  const handleCompleteMeal = (mealId) => {
    console.log(`API Call: Completing Meal ${mealId}`);
  };

  const handleHoldOrder = () => {
    console.log(`API Call: Putting Order on Hold`);
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8">
      {/* header section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order {order.id}</h1>
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
              onClick={handleHoldOrder}
              className="flex items-center gap-1 rounded-full border border-red-100 px-4 py-1.5 text-[10px] font-bold text-red-500 transition-all hover:bg-red-50"
            >
              <XCircle size={14} /> Hold Order
            </button>
          )}
        </div>
      </div>

      {/* stepper logic */}
      <div className="mt-6">
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
            <span className="font-bold text-orange-500 uppercase tracking-wider text-xs mr-2">Note:</span>
            {order.kitchenNote}
          </p>
        </div>
      )}

      {/* table section */}
      <div className="mt-8">
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
        onAssign={confirmAssignment}
        mealName={targetMeal?.name}
      />
    </div>
  );
};

export default SelectedOrder;
