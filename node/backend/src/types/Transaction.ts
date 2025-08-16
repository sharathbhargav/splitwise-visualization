/**
 * Core data types for the Spending Analyzer application
 * These interfaces define the structure of transaction data and related entities
 */

/**
 * Represents a single person's share in a transaction
 */
export interface PersonShare {
  /** Name of the person */
  name: string;
  /** Amount this person owes or is owed (negative means they paid, positive means they owe) */
  amount: number;
}

/**
 * Represents a single transaction from the CSV file
 */
export interface Transaction {
  /** Transaction date in YYYY-MM-DD format */
  date: string;
  /** Store name or description */
  description: string;
  /** Spending category (e.g., Groceries, Dining out) */
  category: string;
  /** Total cost of the transaction */
  cost: number;
  /** Currency code (e.g., USD) */
  currency: string;
  /** Array of each person's share in this transaction */
  shares: PersonShare[];
}

/**
 * Represents suggested groupings of store name variations
 */
export interface StoreGrouping {
  /** Canonical store name */
  canonicalName: string;
  /** Array of variations found in the data */
  variations: string[];
}

/**
 * Filter object for data analysis queries
 */
export interface AnalysisFilters {
  /** Start date for filtering (YYYY-MM-DD) */
  startDate?: string;
  /** End date for filtering (YYYY-MM-DD) */
  endDate?: string;
  /** Array of person names to include */
  people?: string[];
  /** Array of categories to include */
  categories?: string[];
  /** Array of store names to include */
  stores?: string[];
}

/**
 * Aggregated spending data for analysis
 */
export interface SpendingData {
  /** Label for this data point (e.g., date, category name, person name) */
  label: string;
  /** Total amount spent */
  amount: number;
  /** Optional breakdown by subcategory */
  breakdown?: { [key: string]: number };
}

/**
 * Metadata about the dataset for populating filters
 */
export interface DatasetMetadata {
  /** All unique person names in the dataset */
  people: string[];
  /** All unique categories in the dataset */
  categories: string[];
  /** All unique store names in the dataset */
  stores: string[];
  /** Date range of the dataset */
  dateRange: {
    start: string;
    end: string;
  };
}


