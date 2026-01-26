import { API_BASE_URL } from '../../../shared/api/baseUrl';
import { DashboardSummaryResponse, Operation, StatsResponse } from '../types';

const fetchJson = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const fetchOperations = async (): Promise<Operation[]> =>
  fetchJson<Operation[]>(`${API_BASE_URL}/operations`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    headers: {
      Accept: 'application/json',
    },
  });

export const fetchStats = async (params: { startDate?: string; endDate?: string }): Promise<StatsResponse> => {
  const query = new URLSearchParams();
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  const queryString = query.toString();
  const url = `${API_BASE_URL}/dashboard${queryString ? `?${queryString}` : ''}`;

  return fetchJson<StatsResponse>(url, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    headers: {
      Accept: 'application/json',
    },
  });
};

export const fetchDashboardSummary = async (params: { month?: string | null }): Promise<DashboardSummaryResponse> => {
  const query = new URLSearchParams();
  if (params.month) query.append('month', params.month);
  query.append('view', 'summary');
  const queryString = query.toString();
  const url = `${API_BASE_URL}/dashboard${queryString ? `?${queryString}` : ''}`;

  return fetchJson<DashboardSummaryResponse>(url, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    headers: {
      Accept: 'application/json',
    },
  });
};
