import { authFetch } from "../apiHelper";

// Fetch all tables for the branch
export const getBranchTablesAPI = async () => {
  try {
    const response = await authFetch(`http://localhost:8080/api/v1/receptionist/tables`);
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    console.error("Error fetching branch tables:", error);
    return { data: null, error: error };
  }
};
