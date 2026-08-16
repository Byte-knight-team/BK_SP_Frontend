import { authFetch, buildApiUrl } from "../apiHelper";

// we use authFetch to automatically include the JWT security token in the request header

// get all inventory items for the table
export const getAllInventoryAPI = async () => {
  try {
    const response = await authFetch(buildApiUrl("/api/v1/kitchen/inventory/all"));
    const result = await response.json();

    return { data: result.data, error: null };
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return { data: null, error: error };
  }
};

// get the logged-in chef's own inventory requests (with manager status)
export const getMyInventoryRequestsAPI = async () => {
  try {
    const response = await authFetch(buildApiUrl("/api/v1/kitchen/inventory/my-requests"));
    const result = await response.json();

    if (!response.ok) {
      return { data: null, error: result.message || "Failed to fetch requests" };
    }

    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// send a stock refill or new item request
export const createInventoryRequestAPI = async (requestData) => {
  try {
    const response = await authFetch(
      buildApiUrl("/api/v1/kitchen/inventory/request"),
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
    const response = await authFetch(buildApiUrl("/api/v1/kitchen/inventory/update"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      // If status is 403, 400, 500.... etc (not 200 or 201) then return it as an error!
      // If the backend crashes and doesn't send any message at all, it will show "Something went wrong"
      return { data: null, error: result.message || "Something went wrong" };
    }

    return { data: result, error: null }; // success case. error is always null
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// update the daily required stock (par level) for an item
export const updateDailyRequiredStockAPI = async (updateData) => {
  try {
    const response = await authFetch(buildApiUrl("/api/v1/kitchen/inventory/daily-required-stock"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return { data: null, error: result.message || "Something went wrong" };
    }

    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};
