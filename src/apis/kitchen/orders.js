import { authFetch } from "../apiHelper";

//get orders by status
export const getOrdersAPI = async (orderStatus) => {
  try {
    const response = await authFetch(
      `http://localhost:8080/api/v1/kitchen/orders?status=${orderStatus}`,
    );
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    console.error(`Error fetching ${orderStatus} orders:`, error);
    return { data: null, error: error };
  }
};

// get a single order detail by ID
export const getOrderDetailsAPI = async (orderId) => {
  try {
    const response = await authFetch(
      `http://localhost:8080/api/v1/kitchen/orders/${orderId}`
    );
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    console.error(`Error fetching order #${orderId} details:`, error);
    return { data: null, error: error };
  }
};


