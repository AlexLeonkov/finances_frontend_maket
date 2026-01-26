import { useEffect, useState } from 'react';
import { fetchStats } from '../api/dashboardApi';
import { StatsResponse } from '../types';

export const useStats = (startDate: string, endDate: string) => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchStats({ startDate, endDate });

        if (!data || !data.totals || !data.teams || !Array.isArray(data.teams)) {
          throw new Error('Invalid response format from /dashboard endpoint');
        }

        if (!isMounted) return;
        setStats(data);
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Не удалось загрузить статистику';
        setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [startDate, endDate]);

  return { stats, loading, error };
};
