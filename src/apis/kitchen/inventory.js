import { authFetch } from "../apiHelper";

// we use authFetch to automatically include the JWT security token in the request header

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
        // (object -> String) - convert the requestData object (javascript object) to a JSON string
        body: JSON.stringify(requestData),
      }
    );
    
    // convert the response to json (String -> Object)
    const result = await response.json();
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// send a direct database update for stock quantity
export const updateInventoryStockAPI = async (updateData) => {
  try {
    const response = await authFetch("http://localhost:8080/api/v1/kitchen/inventory/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      }
    );
    
    const result = await response.json();

    if (!response.ok) {
      // If status is 403 or 400, return it as an error!
      // If the backend crashes and doesn't send any message at all, it will show "Something went wrong"
      return { data: null, error: result.message || "Something went wrong" };
    }

    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};


