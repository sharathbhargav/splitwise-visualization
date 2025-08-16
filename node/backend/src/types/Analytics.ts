/**
 * Advanced analytics types for the Spending Analyzer application
 * These interfaces define the structure for complex spending pattern analysis
 */

import { Transaction } from './Transaction';

/**
 * Detailed payment pattern analysis for individual users
 * Tracks spending behavior, preferences, and frequency patterns
 */
export interface PaymentPattern {
  /** Name of the person being analyzed */
  person: string;
  /** Breakdown of spending by category with amount and transaction count */
  categoryBreakdown: { [category: string]: { amount: number; count: number } };
  /** List of preferred stores ranked by frequency and total spending */
  preferredStores: { store: string; frequency: number; totalSpent: number }[];
  /** Average transaction size for this person */
  averageTransactionSize: number;
  /** Number of transactions per day of the week */
  paymentFrequency: { [dayOfWeek: string]: number };
  /** Monthly spending totals */
  monthlySpending: { [month: string]: number };
}

/**
 * Comprehensive analytics for individual stores
 * Tracks visit patterns, spending trends, and customer behavior
 */
export interface StoreAnalytics {
  /** Canonical store name */
  storeName: string;
  /** Number of visits to this store */
  visitFrequency: number;
  /** Average amount spent per visit */
  averageSpend: number;
  /** Total amount spent at this store */
  totalSpent: number;
  /** Most popular visit days ranked by frequency */
  popularDays: { day: string; frequency: number }[];
  /** Categories of items purchased at this store */
  categories: string[];
  /** Date of first recorded visit (YYYY-MM-DD) */
  firstVisited: string;
  /** Date of most recent visit (YYYY-MM-DD) */
  lastVisited: string;
  /** Monthly spending trend with visit counts */
  monthlyTrend: { month: string; amount: number; visits: number }[];
}

/**
 * Category-based spending trends and patterns
 * Analyzes growth, transaction patterns, and store preferences by category
 */
export interface CategoryTrend {
  /** Category name */
  category: string;
  /** Monthly spending progression with transaction counts */
  monthlySpend: { month: string; amount: number; count: number }[];
  /** Month-over-month growth rate percentage */
  growthRate: number;
  /** Transaction with the highest amount in this category */
  largestTransaction: Transaction;
  /** Transaction with the lowest amount in this category */
  smallestTransaction: Transaction;
  /** Average transaction size for this category */
  averageTransactionSize: number;
  /** Preferred stores for this category ranked by amount and frequency */
  commonStores: { store: string; amount: number; frequency: number }[];
  /** Spending distribution by day of week */
  dayOfWeekPattern: { [day: string]: number };
}

/**
 * Balance tracking and debt analysis between users
 * Monitors who owes what to whom over time
 */
export interface BalanceAnalytics {
  /** Current balance for each person (positive = owed money, negative = owes money) */
  currentBalance: { [person: string]: number };
  /** Historical balance changes over time for each person */
  balanceHistory: { date: string; balance: number; person: string }[];
  /** Monthly net balance changes for each person */
  monthlyBalanceChange: { month: string; change: number }[];
  /** Number of transactions each person was involved in */
  paymentFrequency: { [person: string]: number };
  /** Period with the largest imbalance between users */
  largestImbalancePeriod: { start: string; end: string; maxImbalance: number };
}

/**
 * Daily spending data for calendar heatmap visualization
 * Provides data points for visual spending pattern analysis
 */
export interface SpendingHeatmap {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Total amount spent on this date */
  amount: number;
  /** Number of transactions on this date */
  transactionCount: number;
  /** Categories of spending that occurred on this date */
  categories: string[];
  /** Day of the week (Monday, Tuesday, etc.) */
  dayOfWeek: string;
  /** Week number within the year (1-52) */
  weekOfYear: number;
}

/**
 * AI-powered budget recommendations and anomaly detection
 * Provides insights for better financial planning
 */
export interface BudgetIntelligence {
  /** Category-based budget recommendations with trend analysis */
  categoryRecommendations: {
    category: string;
    suggestedBudget: number;
    currentMonthlyAverage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
  }[];
  /** Detected spending anomalies and outliers */
  anomalies: {
    transaction: Transaction;
    anomalyType: 'unusually_high' | 'unusual_store' | 'unusual_category';
    score: number;
  }[];
  /** Predicted spending for next month by category */
  predictedNextMonthSpending: {
    category: string;
    predictedAmount: number;
    confidence: number;
  }[];
}
