import axios from 'axios';

const API_URL = 'http://localhost:8080/api/orders';

// Configure axios defaults if needed (e.g., auth headers)
// axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

const orderService = {
    getAllOrders: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    getOrderById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching order ${id}:`, error);
            throw error;
        }
    },

    cancelOrder: async (orderId, reason) => {
        try {
            const response = await axios.put(`${API_URL}/${orderId}/cancel`, { reason });
            return response.data;
        } catch (error) {
            console.error(`Error cancelling order ${orderId}:`, error);
            throw error;
        }
    }
};

export default orderService;
