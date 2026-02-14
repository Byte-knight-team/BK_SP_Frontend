import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Home,
  Clock,
  ChefHat,
  Check,
  X,
  Lightbulb
} from 'lucide-react';

import { mockOrders, availableChefs, getOrderById } from '../../services/mockData';
import { notificationService } from '../../services/notificationService';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [meals, setMeals] = useState([]);
  const [assignModal, setAssignModal] = useState({ open: false, mealId: null });
  const [cancelModal, setCancelModal] = useState({ open: false, mealId: null });
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonError, setCancelReasonError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Simulate API call
    const orderData = getOrderById(orderId);
    if (orderData) {
      setOrder(orderData);
      setMeals(orderData.items.map(meal => ({ ...meal })));
    }
  }, [orderId]);

  const getProcessedCount = () => {
    return meals.filter(meal => meal.status === 'assigned' || meal.status === 'cancelled').length;
  };

  const getAssignedCount = () => {
    return meals.filter(meal => meal.status === 'assigned').length;
  };

  const getCancelledCount = () => {
    return meals.filter(meal => meal.status === 'cancelled').length;
  };

  const openAssignModal = (mealId) => {
    setAssignModal({ open: true, mealId });
  };
  const closeAssignModal = () => {
    setAssignModal({ open: false, mealId: null });
  };
  const confirmAssignChef = (chef) => {
    setMeals(prev => prev.map(meal =>
      meal.id === assignModal.mealId
        ? { ...meal, assignedChef: chef, status: 'assigned' }
        : meal
    ));
    closeAssignModal();
  };

  const openCancelModal = (mealId) => {
    setCancelModal({ open: true, mealId });
    setCancelReason("");
    setCancelReasonError("");
  };
  const closeCancelModal = () => {
    setCancelModal({ open: false, mealId: null });
    setCancelReason("");
    setCancelReasonError("");
  };
  const submitCancelReason = async () => {
    const trimmedReason = cancelReason.trim();
    if (!trimmedReason) {
      setCancelReasonError("Cancellation reason is required.");
      return;
    }

    const cancelledMeal = meals.find(meal => meal.id === cancelModal.mealId);

    // Simulate API calls to notify receptionist/customer
    await notificationService.sendNotification('receptionist', 'meal_cancellation', {
      orderId: order.id,
      mealId: cancelModal.mealId,
      mealName: cancelledMeal?.name,
      reason: trimmedReason,
    });

    await notificationService.sendNotification('customer', 'meal_cancellation', {
      orderId: order.id,
      mealId: cancelModal.mealId,
      mealName: cancelledMeal?.name,
      reason: trimmedReason,
    });

    setMeals(prev => prev.map(meal =>
      meal.id === cancelModal.mealId
        ? { ...meal, status: 'cancelled', cancelReason: trimmedReason }
        : meal
    ));
    setSuccessMsg("Message sent successfully");
    setTimeout(() => setSuccessMsg(""), 3000);
    closeCancelModal();
  };

  const handleUndoAssignment = (mealId) => {
    setMeals(prev => prev.map(meal =>
      meal.id === mealId
        ? { ...meal, assignedChef: null, status: 'pending' }
        : meal
    ));
  };

  const allMealsProcessed = getProcessedCount() === meals.length && meals.length > 0;

  const handleConfirmOrder = () => {
    // API call to confirm order and move to preparing status
    alert('Order confirmed and moved to preparing!');
    navigate('/kitchen');
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-light)] flex items-center justify-center">
        <p className="text-[var(--color-text-muted)]">Loading order...</p>
      </div>
    );
  }

  // Modals and Success Popup
  // Assign Chef Modal
  const assignChefModal = assignModal.open && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="font-bold text-xl mb-4 text-[var(--color-primary)]">Assign Chef</h2>
        <div className="space-y-3">
          {availableChefs.map(chef => (
            <button
              key={chef.id}
              onClick={() => confirmAssignChef(chef)}
              className="w-full py-2 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >{chef.name}</button>
          ))}
        </div>
        <button
          onClick={closeAssignModal}
          className="mt-6 w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >Cancel</button>
      </div>
    </div>
  );

  // Cancel Meal Modal
  const cancelMealModal = cancelModal.open && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="font-semibold text-lg mb-2">Cancel Meal</h2>
        <p className="text-sm text-gray-500 mb-4">
          Reason will be sent to receptionist and customer.
        </p>
        <input
          type="text"
          value={cancelReason}
          onChange={e => {
            setCancelReason(e.target.value);
            if (cancelReasonError) setCancelReasonError("");
          }}
          placeholder="Enter reason for cancellation"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
        />
        {cancelReasonError && (
          <p className="text-sm text-red-500 mb-3">{cancelReasonError}</p>
        )}
        <button
          onClick={submitCancelReason}
          className="w-full py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors mb-2 disabled:bg-orange-300 disabled:cursor-not-allowed"
          disabled={!cancelReason.trim()}
        >Submit Reason</button>
        <button
          onClick={closeCancelModal}
          className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >Cancel</button>
      </div>
    </div>
  );

  // Success Popup
  const successPopup = successMsg && (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
      {successMsg}
    </div>
  );

  return (
    <>
      {assignChefModal}
      {cancelMealModal}
      {successPopup}
      <div className="min-h-screen bg-[var(--color-bg-light)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-orange-500 text-white">
          <div className="px-6 py-4">
            <button
              onClick={() => navigate('/kitchen')}
              className="flex items-center gap-2 text-white/90 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Kitchen</span>
            </button>
            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
            <p className="text-white/80 text-sm">Assign chefs to each meal</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          {/* Order Information Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-[var(--color-text-main)] mb-4">Order Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-medium text-[var(--color-text-main)]">{order.customer}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-[var(--color-text-main)]">{order.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-medium text-[var(--color-text-main)]">Table #{order.tableNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Order Time</p>
                  <p className="font-medium text-[var(--color-text-main)]">{order.orderTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Process All Meals Progress */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-text-main)]">Process all meals</p>
                  <p className="text-sm text-gray-500">
                    {getProcessedCount()} of {meals.length} meals processed ({getAssignedCount()} assigned, {getCancelledCount()} cancelled)
                  </p>
                </div>
              </div>
              <div className="w-14 h-14 rounded-full border-4 border-[var(--color-primary)] flex items-center justify-center">
                <span className="text-lg font-bold text-[var(--color-primary)]">
                  {getProcessedCount()}/{meals.length}
                </span>
              </div>
            </div>
          </div>

          {/* Meal Cards - 2 column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meals.map((meal, index) => (
              <div
                key={meal.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden ${meal.status === 'cancelled' ? 'opacity-50' : ''
                  }`}
              >
                {/* Meal Header */}
                <div className="p-4 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${meal.status === 'assigned'
                      ? 'bg-green-500 text-white'
                      : meal.status === 'cancelled'
                        ? 'bg-gray-300 text-gray-500'
                        : 'bg-orange-100 text-[var(--color-primary)]'
                    }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--color-text-main)] text-lg">{meal.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {meal.quantity}</p>
                  </div>
                </div>

                {/* Meal Content - Based on Status */}
                {meal.status === 'assigned' && meal.assignedChef && (
                  <div className="px-4 pb-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <ChefHat className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-green-600">Assigned to</p>
                          <p className="font-medium text-green-700">{meal.assignedChef.name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUndoAssignment(meal.id)}
                        className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                )}

                {meal.status === 'cancelled' && (
                  <div className="px-4 pb-4">
                    <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                        <X className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-gray-500 font-medium">Meal Cancelled</p>
                      {meal.cancelReason && (
                        <p className="text-xs text-gray-400 mt-2">Reason: {meal.cancelReason}</p>
                      )}
                    </div>
                  </div>
                )}

                {meal.status === 'pending' && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openAssignModal(meal.id)}
                        className="flex-1 py-2 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                      >Assign Chef</button>
                      <button
                        onClick={() => openCancelModal(meal.id)}
                        className="flex-1 py-2 bg-orange-50 text-[var(--color-primary)] font-semibold rounded-lg hover:bg-orange-100 transition-colors"
                      >Cancel Meal</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tip Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Tip:</span> Process each meal individually by either assigning a chef or canceling it. Once all meals are processed, the order will move to the next status.
            </p>
          </div>

          {/* Confirm Button - Shows when all meals are processed */}
          {allMealsProcessed && (
            <button
              onClick={handleConfirmOrder}
              className="w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-orange-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
            >
              Confirm & Start Preparing
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderDetails;
