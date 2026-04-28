import { authFetch } from '../apiHelper'

const chefsStats = {
  totalChefs: 10,
  availableChefs: 5,
  busyChefs: 5,
  averagePrepTimeInMinutes: 15,
}

export const getChefsStatsAPI = async () => {
  try {
    // TODO: uncomment this section once the API is ready
    // const response = await fetch(
    //   `https://mpc2e51a3b857d0cbb58.free.beeceptor.com/chefs-stats`,
    // );
    // const data = await response.json();
    // return {data, error: null};
    return { data: chefsStats, error: null }
  } catch (error) {
    console.error('Error fetching chefs stats:', error)
    return { data: null, error: error }
  }
}

// Get all chefs details for today
export const getChefsAPI = async () => {
  try {
    const response = await authFetch(
      'http://localhost:8080/api/v1/kitchen/chefs/today-details',
    )

    const result = await response.json()

    // We return result.data because the backend wraps everything in a StandardResponse
    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error fetching chefs details:', error)
    return { data: null, error: error }
  }
}

// Get all available Line Chefs for the assign dropdown
export const getAvailableChefsAPI = async () => {
  try {
    const response = await authFetch(
      'http://localhost:8080/api/v1/kitchen/available-chefs',
    )

    const result = await response.json()

    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error fetching available chefs:', error)
    return { data: null, error: error }
  }
}

// Check in a chef
export const checkInChefAPI = async (chefId) => {
  try {
    const response = await authFetch(`http://localhost:8080/api/v1/kitchen/chefs/${chefId}/check-in`, { method: "POST" });
    const result = await response.json();
    if (!response.ok) return { data: null, error: result.message || "Check-in failed" };
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};
