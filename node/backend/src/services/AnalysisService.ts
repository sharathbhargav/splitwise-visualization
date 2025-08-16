import { Transaction, AnalysisFilters, SpendingData, DatasetMetadata } from '../types/Transaction';

export class AnalysisService {
  /**
   * Get metadata about the dataset for populating filters
   */
  static getMetadata(transactions: Transaction[]): DatasetMetadata {
    const people = [...new Set(transactions.flatMap(t => t.shares.map(s => s.name)))];
    const categories = [...new Set(transactions.map(t => t.category))];
    const stores = [...new Set(transactions.map(t => t.description))];
    
    const dates = transactions.map(t => t.date).sort();
    const dateRange = {
      start: dates[0],
      end: dates[dates.length - 1]
    };

    return {
      people,
      categories,
      stores,
      dateRange
    };
  }

  /**
   * Filter transactions based on provided criteria
   */
  private static filterTransactions(
    transactions: Transaction[],
    filters: AnalysisFilters
  ): Transaction[] {
    return transactions.filter(transaction => {
      // Date range filter
      if (filters.startDate && transaction.date < filters.startDate) return false;
      if (filters.endDate && transaction.date > filters.endDate) return false;

      // Category filter
      if (filters.categories?.length && !filters.categories.includes(transaction.category)) {
        return false;
      }

      // Store filter
      if (filters.stores?.length && !filters.stores.includes(transaction.description)) {
        return false;
      }

      // People filter
      if (filters.people?.length) {
        const transactionPeople = transaction.shares.map(s => s.name);
        if (!filters.people.some(person => transactionPeople.includes(person))) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Group transactions by time interval (day, week, or month)
   */
  static getSpendingOverTime(
    transactions: Transaction[],
    filters: AnalysisFilters,
    interval: 'day' | 'week' | 'month' = 'day'
  ): SpendingData[] {
    const filtered = this.filterTransactions(transactions, filters);
    const groupedData = new Map<string, number>();

    filtered.forEach(transaction => {
      let groupKey = transaction.date; // For daily grouping

      if (interval === 'week') {
        const date = new Date(transaction.date);
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        groupKey = startOfWeek.toISOString().split('T')[0];
      } else if (interval === 'month') {
        groupKey = transaction.date.substring(0, 7); // YYYY-MM
      }

      const currentAmount = groupedData.get(groupKey) || 0;
      groupedData.set(groupKey, currentAmount + transaction.cost);
    });

    return Array.from(groupedData.entries())
      .map(([label, amount]) => ({ label, amount }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  /**
   * Group spending by a specific dimension (category, store, or person)
   */
  static getSpendingBy(
    transactions: Transaction[],
    filters: AnalysisFilters,
    dimension: 'category' | 'store' | 'person'
  ): SpendingData[] {
    const filtered = this.filterTransactions(transactions, filters);
    const groupedData = new Map<string, number>();

    filtered.forEach(transaction => {
      if (dimension === 'person') {
        // Handle per-person spending
        transaction.shares.forEach(share => {
          const currentAmount = groupedData.get(share.name) || 0;
          groupedData.set(share.name, currentAmount + share.amount);
        });
      } else {
        // Handle category or store grouping
        const key = dimension === 'category' ? transaction.category : transaction.description;
        const currentAmount = groupedData.get(key) || 0;
        groupedData.set(key, currentAmount + transaction.cost);
      }
    });

    return Array.from(groupedData.entries())
      .map(([label, amount]) => ({ label, amount }))
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
  }

  /**
   * Get detailed transaction data with optional filters
   */
  static getDetailedTransactions(
    transactions: Transaction[],
    filters: AnalysisFilters,
    page: number = 1,
    pageSize: number = 20
  ): { transactions: Transaction[]; total: number } {
    const filtered = this.filterTransactions(transactions, filters);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      transactions: filtered.slice(start, end),
      total: filtered.length
    };
  }
}
