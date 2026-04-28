import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/manager/staff';

export const ManagerStaffService = {
  getStaffSummary: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/summary`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching staff summary:', error);
      throw error.response?.data?.message || 'Failed to fetch staff data';
    }
  }
};
