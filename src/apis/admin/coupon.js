import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const BASE_URL = `${API_BASE}/api/admin/coupons`;

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

export const getCouponByIdAPI = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Failed to fetch coupon details');
    }
    throw new Error('Network error or server is down');
  }
};

export const updateCouponAPI = async (id, updateData) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, updateData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      const msg = error.response.data.message || error.response.data.error || 'Failed to update coupon';
      throw new Error(msg);
    }
    throw new Error('Network error or server is down');
  }
};

export const updateCouponStatusAPI = async (id, status) => {
  try {
    const response = await axios.patch(`${BASE_URL}/${id}/status`, { status }, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      const msg = error.response.data.message || error.response.data.error || 'Failed to update coupon status';
      throw new Error(msg);
    }
    throw new Error('Network error or server is down');
  }
};
