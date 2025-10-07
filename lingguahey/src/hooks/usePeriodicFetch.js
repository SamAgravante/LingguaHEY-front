import { useState, useEffect } from 'react';

export const usePeriodicFetch = (fetchFunction, interval = 250) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchFunction();
        setData(result);
      } catch (err) {
        setError(err);
      }
    };

    // Initial fetch immediately
    fetchData();

    // Set up periodic fetching with shorter interval (250ms)
    const intervalId = setInterval(fetchData, interval);

    // Add event listener for focus to trigger immediate update
    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchFunction, interval]);

  return { data, error, refetch: async () => {
    try {
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err);
    }
  }};
};