import { Transaction, AnalysisFilters, SpendingData, DatasetMetadata } from '../types/Transaction';

export class AnalysisService {
  /**
   * Creates a reverse mapping from store variations to their canonical names
   */
  private static createStoreMapping(storeMappings: { [canonicalName: string]: string[] }): Map<string, string> {
    const storeToCanonical = new Map<string, string>();
    Object.entries(storeMappings).forEach(([canonical, variations]) => {
      storeToCanonical.set(canonical, canonical); // Map canonical to itself
      variations.forEach(variation => {
        storeToCanonical.set(variation, canonical);
      });
    });
    return storeToCanonical;
  }

  /**
   * Get metadata about the dataset for populating filters
   * Only includes confirmed canonical store names from mappings
   */
  static getMetadata(transactions: Transaction[], storeMappings: { [canonicalName: string]: string[] }): DatasetMetadata {
    const people = [...new Set(transactions.flatMap(t => t.shares.map(s => s.name)))];
    const categories = [...new Set(transactions.map(t => t.category))];
    
    // Only include stores that have been normalized (exist in mappings)
    const stores = Object.keys(storeMappings);
    
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
   * Only matches against canonical store names from mappings
   */
  private static filterTransactions(
    transactions: Transaction[],
    filters: AnalysisFilters,
    storeMappings: { [canonicalName: string]: string[] }
  ): Transaction[] {
    const storeToCanonical = this.createStoreMapping(storeMappings);

    return transactions.filter(transaction => {
      // Date range filter
      if (filters.startDate && transaction.date < filters.startDate) return false;
      if (filters.endDate && transaction.date > filters.endDate) return false;

      // Category filter
      if (filters.categories?.length && !filters.categories.includes(transaction.category)) {
        return false;
      }

      // Store filter - only match if store exists in mappings
      if (filters.stores?.length) {
        const canonicalName = storeToCanonical.get(transaction.description);
        // If store isn't in mappings or canonical name isn't in filter, exclude it
        if (!canonicalName || !filters.stores.includes(canonicalName)) {
          return false;
        }
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
    storeMappings: { [canonicalName: string]: string[] },
    interval: 'day' | 'week' | 'month' = 'day'
  ): SpendingData[] {
    const filtered = this.filterTransactions(transactions, filters, storeMappings);
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
   * For stores, only shows confirmed canonical names from mappings
   */
  static getSpendingBy(
    transactions: Transaction[],
    filters: AnalysisFilters,
    storeMappings: { [canonicalName: string]: string[] },
    dimension: 'category' | 'store' | 'person'
  ): SpendingData[] {
    const filtered = this.filterTransactions(transactions, filters, storeMappings);
    const groupedData = new Map<string, number>();

    // Create reverse mapping for store names if needed
    const storeToCanonical = dimension === 'store' ? this.createStoreMapping(storeMappings) : null;

    filtered.forEach(transaction => {
      if (dimension === 'person') {
        // Handle per-person spending
        transaction.shares.forEach(share => {
          const currentAmount = groupedData.get(share.name) || 0;
          groupedData.set(share.name, currentAmount + share.amount);
        });
      } else {
        // Handle category or store grouping
        let key;
        if (dimension === 'category') {
          key = transaction.category;
        } else { // store
          // Only include stores that have been normalized
          const canonicalName = storeToCanonical?.get(transaction.description);
          if (!canonicalName) return; // Skip stores not in mappings
          key = canonicalName;
        }
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
   * Shows canonical store names for mapped stores
   */
  static getDetailedTransactions(
    transactions: Transaction[],
    filters: AnalysisFilters,
    storeMappings: { [canonicalName: string]: string[] },
    page: number = 1,
    pageSize: number = 20
  ): { transactions: Transaction[]; total: number } {
    const filtered = this.filterTransactions(transactions, filters, storeMappings);
    const storeToCanonical = this.createStoreMapping(storeMappings);

    // Replace store names with their canonical names where applicable
    const transformedTransactions = filtered.map(transaction => {
      const canonicalName = storeToCanonical.get(transaction.description);
      if (canonicalName) {
        return {
          ...transaction,
          description: canonicalName
        };
      }
      return transaction;
    });

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      transactions: transformedTransactions.slice(start, end),
      total: transformedTransactions.length
    };
  }
}