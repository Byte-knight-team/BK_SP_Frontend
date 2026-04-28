import { useState, useEffect, useCallback } from 'react';
import { ManagerStaffService } from '../apis/manager/ManagerStaffService';

export const useStaffData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStaffData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await ManagerStaffService.getStaffSummary();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  return {
    data,
    loading,
    error,
    refetch: fetchStaffData
  };
};
