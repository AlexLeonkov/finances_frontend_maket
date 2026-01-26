import axios from 'axios';
import { API_BASE_URL } from '../../../shared/api/baseUrl';
import { DashboardSummaryResponse, Operation, StatsResponse } from '../types';

const axiosConfig = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: false,
});

export const fetchOperations = async (): Promise<Operation[]> => {
  const { data } = await axiosConfig.get<Operation[]>('/operations');
  return data;
};

export const fetchStats = async (params: { startDate?: string; endDate?: string }): Promise<StatsResponse> => {
  const { data } = await axiosConfig.get<StatsResponse>('/dashboard', {
    params: {
      startDate: params.startDate || undefined,
      endDate: params.endDate || undefined,
    },
  });
  return data;
};

export const fetchDashboardSummary = async (params: { month?: string | null }): Promise<DashboardSummaryResponse> => {
  const { data } = await axiosConfig.get<DashboardSummaryResponse>('/dashboard', {
    params: {
      month: params.month || undefined,
      view: 'summary',
    },
  });
  return data;
};
