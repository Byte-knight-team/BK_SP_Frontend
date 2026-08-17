import { authFetch, buildApiUrl } from "../apiHelper";

// get order-cards by status
export const getOrderCardsAPI = async (orderStatus) => {
  try {
    const response = await authFetch(
      buildApiUrl(`/api/v1/kitchen/order-cards?status=${orderStatus}`)
    );
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

// get a single order's details by ID
export const getOrderDetailsAPI = async (orderId) => {
  try {
    const response = await authFetch(
      buildApiUrl(`/api/v1/kitchen/order-details/${orderId}`)
    );
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

// get available line chefs for assignment
// returns: [{ staffId, chefName, workStatus, activeItemCount }]
export const getAvailableChefsAPI = async () => {
  try {
    const response = await authFetch(buildApiUrl(`/api/v1/kitchen/available-chefs`));
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

// assign a line chef to a meal item
export const assignChefToMealAPI = async (itemId, chefStaffId) => {
  try {
    const response = await authFetch(
      buildApiUrl(`/api/v1/kitchen/order-items/${itemId}/assign`),
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chefStaffId }),
      }
    );
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

// put an order on hold
export const holdOrderAPI = async (orderId, holdReason) => {
  try {
    const response = await authFetch(
      buildApiUrl(`/api/v1/kitchen/orders/${orderId}/hold`),
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdReason }),
      }
    );
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

// get paged + filtered order history
export const getOrderHistoryAPI = async ({ page = 0, size = 10, date, status } = {}) => {
  try {
    const params = new URLSearchParams({ page, size });
    if (date) params.set("date", date);
    if (status && status !== "ALL") params.set("status", status);
    const response = await authFetch(
      buildApiUrl(`/api/v1/kitchen/order-history?${params.toString()}`)
    );
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};
