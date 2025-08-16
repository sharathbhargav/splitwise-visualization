import axios from 'axios';
import {
  UploadResponse,
  StoreGroupingsResponse,
  StoreMappingsResponse,
  DatasetMetadata,
  AnalysisFilters,
  SpendingData,
  Transaction
} from '../types';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true
});

export const uploadCSV = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<UploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getStoreGroupings = async (): Promise<StoreGroupingsResponse> => {
  const response = await api.get<StoreGroupingsResponse>('/stores/suggestions');
  return response.data;
};

export const applyStoreMappings = async (
  mappings: { [key: string]: string[] }
): Promise<StoreMappingsResponse> => {
  const response = await api.post<StoreMappingsResponse>('/stores/mappings', mappings);
  return response.data;
};

export const getMetadata = async (): Promise<DatasetMetadata> => {
  const response = await api.get<DatasetMetadata>('/analysis/metadata');
  return response.data;
};

export const getSpendingAnalysis = async (
  filters: AnalysisFilters,
  groupBy: 'time' | 'category' | 'store' | 'person' | 'transactions',
  timeInterval?: 'day' | 'week' | 'month',
  page?: number,
  pageSize?: number
): Promise<SpendingData[] | { transactions: Transaction[]; total: number }> => {
  const params = new URLSearchParams();

  // Add filters to query params
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.people?.length) params.append('people', filters.people.join(','));
  if (filters.categories?.length) params.append('categories', filters.categories.join(','));
  if (filters.stores?.length) params.append('stores', filters.stores.join(','));

  // Add grouping params
  params.append('groupBy', groupBy);
  if (groupBy === 'time' && timeInterval) {
    params.append('interval', timeInterval);
  }

  // Add pagination params
  if (page) params.append('page', page.toString());
  if (pageSize) params.append('pageSize', pageSize.toString());

  const response = await api.get('/analysis', { params });
  return response.data;
};
