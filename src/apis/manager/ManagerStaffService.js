import { authFetch } from '../apiHelper';

const API_URL = 'http://localhost:8080/api/v1/manager/staff';

export const ManagerStaffService = {
  getStaffSummary: async () => {
    try {
      const response = await authFetch(`${API_URL}/summary`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch staff data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching staff summary:', error);
      throw error.message || 'Failed to fetch staff data';
    }
  }
};
