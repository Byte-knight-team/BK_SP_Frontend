import { authFetch } from "../apiHelper";

// get all inventory items for the table
export const getAllInventoryAPI = async () => {
  try {
    const response = await authFetch("http://localhost:8080/api/v1/kitchen/inventory/all");
    const result = await response.json();

    return { data: result.data, error: null };
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return { data: null, error: error };
  }
};

// send a stock refill or new item request
export const createInventoryRequestAPI = async (requestData) => {
  try {
    const response = await authFetch(
      "http://localhost:8080/api/v1/kitchen/inventory/request",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      }
    );
    
    // convert the response to json
    const result = await response.json();
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};
