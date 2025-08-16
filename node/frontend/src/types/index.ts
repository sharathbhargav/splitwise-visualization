/**
 * Core data types for the frontend application
 */

export interface PersonShare {
  name: string;
  amount: number;
}

export interface Transaction {
  date: string;
  description: string;
  category: string;
  cost: number;
  currency: string;
  shares: PersonShare[];
}

export interface StoreGrouping {
  canonicalName: string;
  variations: string[];
}

export interface AnalysisFilters {
  startDate?: string;
  endDate?: string;
  people?: string[];
  categories?: string[];
  stores?: string[];
}

export interface SpendingData {
  label: string;
  amount: number;
  breakdown?: { [key: string]: number };
}

export interface DatasetMetadata {
  people: string[];
  categories: string[];
  stores: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

export interface UploadResponse {
  message: string;
  summary: {
    totalTransactions: number;
    dateRange: {
      start: string;
      end: string;
    };
    people: string[];
    categories: string[];
  };
}

export interface StoreGroupingsResponse {
  suggestions: StoreGrouping[];
}

export interface StoreMappingsResponse {
  message: string;
  transactionCount: number;
}
