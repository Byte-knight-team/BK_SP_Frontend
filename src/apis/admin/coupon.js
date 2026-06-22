import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/admin/coupons';

const getAuthToken = () => localStorage.getItem('token');

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const createCouponAPI = async (couponData) => {
  try {
    const response = await axios.post(BASE_URL, couponData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      const msg = error.response.data.message || error.response.data.error || 'Failed to create coupon';
      throw new Error(msg);
    }
    throw new Error('Network error or server is down');
  }
};

export const getCouponsAPI = async () => {
  try {
    const response = await axios.get(BASE_URL, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch coupons');
    }
    throw new Error('Network error or server is down');
  }
};
