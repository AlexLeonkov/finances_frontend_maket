import { useEffect, useState } from 'react';
import { fetchDashboardSummary } from '../api/dashboardApi';
import { DashboardSummaryResponse } from '../types';

export const useDashboardSummary = (selectedMonth: string | null) => {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDashboardSummary({ month: selectedMonth });
        if (!isMounted) return;
        setSummary(data);
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Не удалось загрузить данные';
        let userMessage = 'Не удалось загрузить данные';
        if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('CORS')) {
          userMessage =
            'Ошибка CORS: сервер не отправляет заголовок Access-Control-Allow-Origin. Сервер должен разрешать запросы с этого домена.';
        } else if (message.includes('Unexpected token') || message.includes('JSON')) {
          userMessage = 'Ошибка формата данных: Сервер вернул невалидный JSON.';
        } else if (message.includes('HTTP error')) {
          userMessage = `Ошибка сервера: ${message}`;
        }
        setError(userMessage);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [selectedMonth]);

  return { summary, loading, error };
};
