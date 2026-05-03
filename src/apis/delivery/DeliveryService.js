import { authFetch } from "../apiHelper";

/**
 * Base URL for all delivery-related API endpoints.
 * Pulled from environment variables for flexibility across environments.
 */
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/delivery`;

/**
 * DeliveryService provides methods to interact with the backend delivery system.
 * Handles order assignments, status transitions, and driver-specific operations.
 */
export const DeliveryService = {
  /**
   * Fetches all orders currently assigned to the logged-in delivery driver.
   * Typically used to populate the driver's dispatch queue or task list.
   * @returns {Promise<Array>} List of assigned orders.
   */
  getAssignedOrders: async () => {
    const response = await authFetch(`${BASE_URL}/orders/assigned`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch assigned orders");
    }
    return response.json();
  },

  /**
   * Retrieves the single order that the driver is currently actively delivering.
   * Useful for the "Current Delivery" view or map tracking.
   * @returns {Promise<Object>} The active order details.
   */
  getActiveOrder: async () => {
    const response = await authFetch(`${BASE_URL}/orders/active`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch active order");
    }
    return response.json();
  },

  /**
   * Confirms that the driver has accepted a newly assigned order.
   * Transitions the order status from ASSIGNED to the next logical state.
   * @param {string|number} orderId - Unique identifier of the order.
   * @returns {Promise<Object>} Updated order status.
   */
  acceptOrder: async (orderId) => {
    const response = await authFetch(`${BASE_URL}/orders/${orderId}/accept`, {
      method: "POST",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to accept order");
    }
    return response.json();
  },

  /**
   * Allows a driver to reject an assigned order, providing a specific reason.
   * This might trigger a re-assignment to another available driver.
   * @param {string|number} orderId - Unique identifier of the order.
   * @param {string} reason - The justification for rejecting the delivery.
   * @returns {Promise<Object>} Confirmation of rejection.
   */
  rejectOrder: async (orderId, reason) => {
    const response = await authFetch(`${BASE_URL}/orders/${orderId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to reject order");
    }
    return response.json();
  },

  /**
   * Updates the progress of a delivery (e.g., 'PICKED_UP', 'ARRIVED', 'DELIVERED').
   * Directly impacts the customer's real-time order tracking status.
   * @param {string|number} orderId - Unique identifier of the order.
   * @param {string} status - The new DeliveryStatus enum value.
   * @returns {Promise<Object>} The updated delivery entity.
   */
  updateDeliveryStatus: async (orderId, status) => {
    const response = await authFetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update status");
    }
    return response.json();
  },
};
