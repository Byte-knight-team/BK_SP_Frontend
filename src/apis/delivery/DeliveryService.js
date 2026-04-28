import { authFetch } from "../apiHelper";

export const DeliveryService = {
  getAssignedOrders: async () => {
    const response = await authFetch("/api/delivery/orders/assigned");
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch assigned orders");
    }
    return response.json();
  },

  getActiveOrder: async () => {
    const response = await authFetch("/api/delivery/orders/active");
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch active order");
    }
    return response.json();
  },

  acceptOrder: async (orderId) => {
    const response = await authFetch(`/api/delivery/orders/${orderId}/accept`, {
      method: "POST",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to accept order");
    }
    return response.json();
  },

  rejectOrder: async (orderId, reason) => {
    const response = await authFetch(`/api/delivery/orders/${orderId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to reject order");
    }
    return response.json();
  },
};
