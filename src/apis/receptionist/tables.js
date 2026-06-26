import { authFetch } from '../apiHelper'

// Fetch all tables for the branch
export const getBranchTablesAPI = async () => {
  try {
    const response = await authFetch(
      `http://localhost:8080/api/v1/receptionist/tables`,
    )
    const result = await response.json()
    return { data: result.data, error: null }
  } catch (error) {
    console.error('Error fetching branch tables:', error)
    return { data: null, error: error }
  }
}

// Mark a table as occupied
export const occupyTableAPI = async (tableId, guestCount) => {
  try {
    const response = await authFetch(
      `http://localhost:8080/api/v1/receptionist/tables/${tableId}/occupy`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestCount }),
      },
    )
    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: result.message || "Failed to occupy table" };
    }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

// Clear an occupied table
export const clearTableAPI = async (tableId) => {
  try {
    const response = await authFetch(
      `http://localhost:8080/api/v1/receptionist/tables/${tableId}/clear`,
      {
        method: 'PUT',
      },
    )
    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: result.message || "Failed to clear table" };
    }

    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}
