import { useState, useEffect } from 'react';
import * as mockData from '../assets/mock/overview.json';

const useFetchData = (weekRange: { start: string, end: string }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          const fetchedData = mockData.responseData;
          setData(fetchedData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [weekRange]);

  return { data, loading, error };
};

export default useFetchData;
