import { useState, useEffect, useCallback } from "react";
import { DeliveryService } from "../apis/delivery/DeliveryService";

export const useDeliveryOrders = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await DeliveryService.getAssignedOrders();
      setData(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Poll for new assignments every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return {
    orders: data,
    loading,
    error,
    refetch: fetchOrders,
  };
};
