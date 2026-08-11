import { useState, useEffect } from 'react';

export const useApi = (apiFunction, params = null, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (customParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunction(customParams || params);
      setData(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return { data, loading, error, execute, setData };
};