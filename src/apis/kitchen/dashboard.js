import { ordersData } from "./orders";

const graphData = [
  { time: "8AM-10AM", mealsCount: 90 },
  { time: "10AM-12PM", mealsCount: 50 },
  { time: "12PM-2PM", mealsCount: 20 },
  { time: "2PM-4PM", mealsCount: 10 },
  { time: "4PM-6PM", mealsCount: 100 },
  { time: "6PM-8PM", mealsCount: 50 },
  { time: "8PM-10PM", mealsCount: 10 },
];

const inventoryAlertsData = [
  {
    itemName: "Wagyu Beef (A5)",
    percentage: 20,
    initialCount: 20,
    availableCount: 4,
    unit: "KG",
    warningLevel: "CRITICAL",
  },
  {
    itemName: "Maldon Sea Salt",
    percentage: 66,
    initialCount: 30,
    availableCount: 10,
    unit: "KG",
    warningLevel: "LOW",
  },
  {
    itemName: "Truffle Oil",
    percentage: 70,
    initialCount: 50,
    availableCount: 5,
    unit: "LITERS",
    warningLevel: "CRITICAL",
  },
  {
    itemName: "Olive Oil",
    percentage: 20,
    initialCount: 50,
    availableCount: 10,
    unit: "LITERS",
    warningLevel: "CRITICAL",
  },
  {
    itemName: "Wagyu Beef (A5)",
    percentage: 20,
    initialCount: 20,
    availableCount: 4,
    unit: "KG",
    warningLevel: "CRITICAL",
  },
  {
    itemName: "Maldon Sea Salt",
    percentage: 66,
    initialCount: 30,
    availableCount: 10,
    unit: "KG",
    warningLevel: "LOW",
  },
  {
    itemName: "Truffle Oil",
    percentage: 70,
    initialCount: 50,
    availableCount: 5,
    unit: "LITERS",
    warningLevel: "CRITICAL",
  },
  {
    itemName: "Olive Oil",
    percentage: 20,
    initialCount: 50,
    availableCount: 10,
    unit: "LITERS",
    warningLevel: "CRITICAL",
  },
];

//get dashboard stats details
export const getDashboardOrderStatsAPI = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/v1/kitchen/stats");
    const result = await response.json();

    return {data: result.data, error: null};  //return an object
  } catch (error) {
    console.error("Error fetching stats :", error);
    return { data: null, error: error };
  }
};

//get dashboard popular meals details
export const getDashboardPopularMealsAPI = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/v1/kitchen/popular-meals");
    const result = await response.json();

    return {data: result.data, error: null};
  } catch (error) {
    console.error("Error fetching popular meals:", error);
    return { data: null, error: error };
  }
};

export const getOrdersAPI = async (orderStatus, limit=null) => {
  try {
    // TODO: uncomment this section once the API is ready
    // const response = await fetch(
    //   `https://mpc2e51a3b857d0cbb58.free.beeceptor.com/orders?status=${orderStatus}&limit=${limit}`,
    // );
    // const data = await response.json();
    // return {data, error: null};
    const filteredOrdersData = ordersData.filter((order) => order.status === orderStatus);
    if (limit) {
      filteredOrdersData.splice(limit);
    }
    return { data: filteredOrdersData, error: null };
  } catch (error) {
    console.error("Error fetching graph data:", error);
    return { data: null, error: error };
  }
};

export const getPeakHoursAPI = async () => {
  try {
    // TODO: uncomment this section once the API is ready
    // const response = await fetch(
    //   "https://mpc2e51a3b857d0cbb58.free.beeceptor.com/low-Inventory",
    // );
    // const data = await response.json();
    // return {data, error: null};

    return { data: graphData, error: null };
  } catch (error) {
    console.error("Error fetching graph data:", error);
    return { data: null, error: error };
  }
};

export const getInventoryAlertsAPI = async () => {
  try {
    // TODO: uncomment this section once the API is ready
    // const response = await fetch(
    //   "https://mpc2e51a3b857d0cbb58.free.beeceptor.com/low-Inventory",
    // );
    // const data = await response.json();
    // return {data, error: null};

    return { data: inventoryAlertsData, error: null };
  } catch (error) {
    console.error("Error fetching graph data:", error);
    return { data: null, error: error };
  }
};
