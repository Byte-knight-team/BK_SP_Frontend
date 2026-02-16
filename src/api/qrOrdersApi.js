import api from "./axios";

// ── Orders ──────────────────────────────────────────────

export const getAllOrders = (status) => {
    const params = status ? { status } : {};
    return api.get("/orders", { params });
};

export const getOrderById = (id) => api.get(`/orders/${id}`);

export const getRecentOrders = () => api.get("/orders/recent");

export const getOrderStats = () => api.get("/orders/stats");

export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);

export const cancelOrder = (id, reason) =>
    api.put(`/orders/${id}/cancel`, { reason });

export const updateOrderStatus = (id, status) =>
    api.patch(`/orders/${id}/status`, { status });
