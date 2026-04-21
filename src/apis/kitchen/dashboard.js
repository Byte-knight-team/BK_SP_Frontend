import { ordersData } from "./orders";

//get dashboard stats details
export const getDashboardOrderStatsAPI = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/v1/kitchen/stats");
    const result = await response.json();

    return { data: result.data, error: null }; //return an object
  } catch (error) {
    console.error("Error fetching stats :", error);
    return { data: null, error: error };
  }
};

//get dashboard popular meals details
export const getDashboardPopularMealsAPI = async () => {
  try {
    const response = await fetch(
      "http://localhost:8080/api/v1/kitchen/popular-meals",
    );
    const result = await response.json();

    return { data: result.data, error: null };
  } catch (error) {
    console.error("Error fetching popular meals:", error);
    return { data: null, error: error };
  }
};

//get dashboard peak hours details
export const getPeakHoursAPI = async () => {
  try {
    const response = await fetch(
      "http://localhost:8080/api/v1/kitchen/peak-hours",
    );
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    console.error("Error fetching peak hours details:", error);
    return { data: null, error: error };
  }
};

//get dashboard inventory alerts details
export const getInventoryAlertsAPI = async () => {
  try {
    const response = await fetch(
      "http://localhost:8080/api/v1/kitchen/inventory-alerts",
    );
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    console.error("Error fetching inventory alerts:", error);
    return { data: null, error: error };
  }
};

//get orders by status
export const getOrdersAPI = async (orderStatus) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/kitchen/orders?status=${orderStatus}`,
    );
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    console.error(`Error fetching ${orderStatus} orders:`, error);
    return { data: null, error: error };
  }
};
