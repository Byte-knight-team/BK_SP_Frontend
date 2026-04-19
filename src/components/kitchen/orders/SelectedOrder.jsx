import React, { useState, useEffect } from "react";
import OrderStepper from "../OrderStepper";
import MealTable from "./MealTable";
import { XCircle, AlertCircle } from "lucide-react";

const SelectedOrder = ({ orderId }) => {
  // 1. දැනට Dummy දත්ත (පස්සේ මේක useEffect එකක් ඇතුළේ API එකෙන් Fetch කරන්න ඕන)
  const [order, setOrder] = useState({
    id: "#ORD-1200",
    time: "2/16/2026 at 10:28 AM",
    status: "Pending", // මේ අගය API එකෙන් එන විදිහට UI එක නිකන්ම මාරු වෙනවා
    holdReason: "",
    meals: [
      { id: 1, name: "Mixed Fried Rice", qty: 2, status: "Pending", chefName: "Not Assigned" },
      { id: 2, name: "Chicken Kottu", qty: 1, status: "Pending", chefName: "Not Assigned" },
    ],
  });

  // 2. Handlers: මෙතන තියෙන්නේ API එකට "Request" එක යවන එක විතරයි
  const handleAssignChef = (mealId, chefName) => {
    console.log(`API Call: Assigning ${chefName} to Meal ${mealId}`);
    // Backend එක update වුණාම අපි මුළු order එකම ආයෙත් fetch කරනවා (Reloading data)
  };

  const handleStartMeal = (mealId) => {
    console.log(`API Call: Starting Meal ${mealId}`);
  };

  const handleCompleteMeal = (mealId) => {
    console.log(`API Call: Completing Meal ${mealId}`);
  };

  const handleCancelOrder = () => {
    console.log(`API Call: Putting Order on Hold`);
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      {/* Header Section */}
      <div className="flex items-start justify-between text-left">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order {order.id}</h1>
          <p className="mt-1 text-sm text-gray-400 font-medium">Placed on {order.time}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            order.status === 'On Hold' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-500'
          }`}>
             {order.status}
          </span>

          {order.status === "Pending" && (
            <button onClick={handleCancelOrder} className="border border-red-100 px-4 py-1 text-[10px] font-bold text-red-500 rounded-full hover:bg-red-50 transition-colors">
              <XCircle size={14} className="inline mr-1" /> Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Stepper Logic (Conditional Rendering පාවිච්චි කරලා) */}
      <div className="mt-6 text-left">
        {order.status === "On Hold" ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4">
            <AlertCircle size={24} className="text-red-500" />
            <div>
              <h3 className="font-bold text-red-800">Awaiting Action</h3>
              <p className="text-red-500 text-xs mt-1">Reason: {order.holdReason || "Not specified"}</p>
            </div>
          </div>
        ) : (
          <OrderStepper status={order.status} />
        )}
      </div>

      {/* Table Section (Props විදිහට දත්ත යවන එක විතරයි කරන්නේ) */}
      <div className="mt-8">
        <MealTable
          mealsData={order.meals}
          orderStatus={order.status}
          onAssignChef={handleAssignChef}
          onStartMeal={handleStartMeal}
          onCompleteMeal={handleCompleteMeal}
        />
      </div>
    </div>
  );
};

export default SelectedOrder;
