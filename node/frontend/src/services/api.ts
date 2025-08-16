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
import {
  PaymentPattern,
  StoreAnalytics,
  CategoryTrend,
  BalanceAnalytics,
  SpendingHeatmap,
  BudgetIntelligence
} from '../types/analytics';

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

// Advanced Analytics API Methods

/**
 * Get payment pattern analysis for all people
 */
export const getPaymentPatterns = async (): Promise<PaymentPattern[]> => {
  const response = await api.get<PaymentPattern[]>('/advanced-analytics/payment-patterns');
  return response.data;
};

/**
 * Get payment pattern analysis for a specific person
 */
export const getPaymentPatternForPerson = async (person: string): Promise<PaymentPattern> => {
  const response = await api.get<PaymentPattern>(`/advanced-analytics/payment-patterns/${encodeURIComponent(person)}`);
  return response.data;
};

/**
 * Get detailed analytics for all stores
 */
export const getStoreAnalytics = async (): Promise<StoreAnalytics[]> => {
  const response = await api.get<StoreAnalytics[]>('/advanced-analytics/stores');
  return response.data;
};

/**
 * Get trend analysis for all spending categories
 */
export const getCategoryTrends = async (): Promise<CategoryTrend[]> => {
  const response = await api.get<CategoryTrend[]>('/advanced-analytics/categories/trends');
  return response.data;
};

/**
 * Get balance analytics between all people
 */
export const getBalanceAnalytics = async (): Promise<BalanceAnalytics> => {
  const response = await api.get<BalanceAnalytics>('/advanced-analytics/balance');
  return response.data;
};

/**
 * Get spending heatmap data for calendar visualization
 * @param startDate Optional start date in YYYY-MM-DD format
 * @param endDate Optional end date in YYYY-MM-DD format
 */
export const getSpendingHeatmap = async (startDate?: string, endDate?: string): Promise<SpendingHeatmap[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await api.get<SpendingHeatmap[]>(`/advanced-analytics/heatmap?${params.toString()}`);
  return response.data;
};

/**
 * Get AI-powered budget recommendations and anomaly detection
 */
export const getBudgetIntelligence = async (): Promise<BudgetIntelligence> => {
  const response = await api.get<BudgetIntelligence>('/advanced-analytics/budget-intelligence');
  return response.data;
};
