import { ordersData } from "./orders";

//single object
const statCard = {
  totalOrders: 124,
  pendingOrders: 12,
  completedOrders: 112,
  averagePrepTimeInMinutes: 15,
};
//object array
const popularMealsData = [
  { 
    mealName: "Mixed Fried Rice", 
    percentage: 85, 
    count: 45 
  },
  { 
    mealName: "Chicken Kottu", 
    percentage: 65, 
    count: 32 
  },
  { 
    mealName: "Signature Burger", 
    percentage: 45, 
    count: 21 
  },
  { 
    mealName: "Pasta Carbonara", 
    percentage: 25, 
    count: 12 
  },
  { 
    mealName: "Noodle Soup", 
    percentage: 15, 
    count: 8 
  },
];


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

export const getDashboardOrderStatsAPI = async () => {
  try {
    // TODO: uncomment this section once the API is ready
    // const response = await fetch(
    //   "https://mpc2e51a3b857d0cbb58.free.beeceptor.com/low-Inventory",
    // );
    // const data = await response.json();
    // return {data, error: null};

    return { data: statCard, error: null }; //we are refering that array using data  
  } catch (error) {
    console.error("Error fetching graph data:", error);
    return { data: null, error: error };
  }
};

export const getDashboardPopularMealsAPI = async () => {
  try {
    // TODO: uncomment this section once the API is ready
    // const response = await fetch(
    //   "https://mpc2e51a3b857d0cbb58.free.beeceptor.com/low-Inventory",
    // );
    // const data = await response.json();
    // return {data, error: null};

    return { data: popularMealsData, error: null };
  } catch (error) {
    console.error("Error fetching graph data:", error);
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
