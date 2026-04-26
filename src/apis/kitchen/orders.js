import { authFetch } from "../apiHelper";

//get order-cards by status
export const getOrderCardsAPI = async (orderStatus) => {
  try {
    const response = await authFetch(
      `http://localhost:8080/api/v1/kitchen/order-cards?status=${orderStatus}`,
    );
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    console.error(`Error fetching ${orderStatus} orders:`, error);
    return { data: null, error: error };
  }
};

// get a single order's details by ID
export const getOrderDetailsAPI = async (orderId) => {
  try {
    const response = await authFetch(
      `http://localhost:8080/api/v1/kitchen/order-details/${orderId}`
    );
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    console.error(`Error fetching order #${orderId} details:`, error);
    return { data: null, error: error };
  }
};

// Get available chefs for assignment (those who are already checked in)
export const getAvailableChefsAPI = async () => {
  try {
    const response = await authFetch(`http://localhost:8080/api/v1/kitchen/available-chefs`);
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    console.error("Error fetching available chefs:", error);
    return { data: null, error: error };
  }
};



