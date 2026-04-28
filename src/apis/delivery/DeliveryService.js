import { authFetch } from "../apiHelper";

const BASE_URL = "http://localhost:8080/api/delivery";

export const DeliveryService = {
  getAssignedOrders: async () => {
    const response = await authFetch(`${BASE_URL}/orders/assigned`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch assigned orders");
    }
    return response.json();
  },

  getActiveOrder: async () => {
    const response = await authFetch(`${BASE_URL}/orders/active`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch active order");
    }
    return response.json();
  },

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
