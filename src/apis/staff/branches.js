import { authFetch } from "../apiHelper";

const BASE_URL = "http://localhost:8080/api/admin/branches";

export const getAllBranchesAPI = async () => {
  try {
    const response = await authFetch(BASE_URL);
    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: result?.message || "Failed to fetch branches",
      };
    }

    return {
      data: result?.data || result,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching branches:", error);
    return {
      data: null,
      error: error.message || "Something went wrong",
    };
  }
};