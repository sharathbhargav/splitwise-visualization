import levenshtein from 'fast-levenshtein';
import { Transaction, StoreGrouping } from '../types/Transaction';

export class StoreAnalysisService {
  /**
   * Analyzes store names in transactions and suggests groupings for similar names
   * Uses Levenshtein distance to measure string similarity
   */
  static analyzeSimilarStores(transactions: Transaction[]): StoreGrouping[] {
    // Extract unique store names
    const storeNames = [...new Set(transactions.map(t => t.description))];
    
    // Normalize store names (lowercase, remove punctuation)
    const normalizedNames = storeNames.map(name => ({
      original: name,
      normalized: name.toLowerCase().replace(/[^\w\s]/g, '')
    }));

    // Group similar names
    const groups: { [key: string]: string[] } = {};
    const processedNames = new Set<string>();

    normalizedNames.forEach(({ original, normalized }) => {
      // Skip if this name is already in a group
      if (processedNames.has(original)) return;

      const similarNames = [original];
      processedNames.add(original);

      // Find similar names using Levenshtein distance
      normalizedNames.forEach(({ original: other, normalized: otherNorm }) => {
        if (original !== other && !processedNames.has(other)) {
          const distance = levenshtein.get(normalized, otherNorm);
          const similarity = 1 - distance / Math.max(normalized.length, otherNorm.length);

          // Consider names similar if they have high similarity
          if (similarity > 0.8) {
            similarNames.push(other);
            processedNames.add(other);
          }
        }
      });

      // Only create a group if there are variations
      if (similarNames.length > 1) {
        // Use the most frequent name as canonical
        const canonicalName = this.findMostFrequent(similarNames, transactions);
        groups[canonicalName] = similarNames.filter(name => name !== canonicalName);
      }
    });

    // Convert groups to array format
    return Object.entries(groups).map(([canonicalName, variations]) => ({
      canonicalName,
      variations
    }));
  }

  /**
   * Finds the most frequently used name from a list of similar names
   */
  private static findMostFrequent(names: string[], transactions: Transaction[]): string {
    const counts = new Map<string, number>();
    
    // Count occurrences of each name
    names.forEach(name => {
      const count = transactions.filter(t => t.description === name).length;
      counts.set(name, count);
    });

    // Return the name with highest count
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * Merges two store groups into one
   */
  static mergeGroups(
    group1: StoreGrouping,
    group2: StoreGrouping,
    transactions: Transaction[]
  ): {
    newGroup: StoreGrouping;
    updatedTransactions: Transaction[];
  } {
    // Combine all names from both groups
    const allNames = [
      group1.canonicalName,
      ...group1.variations,
      group2.canonicalName,
      ...group2.variations
    ];

    // Find the most frequent name to use as canonical
    const canonicalName = this.findMostFrequent(allNames, transactions);

    // Create new group with all variations
    const variations = allNames.filter(name => name !== canonicalName);
    const newGroup: StoreGrouping = { canonicalName, variations };

    // Update transactions with new canonical name
    const updatedTransactions = transactions.map(transaction => {
      if (allNames.includes(transaction.description)) {
        return {
          ...transaction,
          description: canonicalName
        };
      }
      return transaction;
    });

    return { newGroup, updatedTransactions };
  }

  /**
   * Splits variations from a group into a new group
   */
  static splitGroup(
    group: StoreGrouping,
    variationsToSplit: string[],
    transactions: Transaction[]
  ): {
    originalGroup: StoreGrouping;
    newGroup: StoreGrouping;
    updatedTransactions: Transaction[];
  } {
    // Update original group
    const originalGroup: StoreGrouping = {
      canonicalName: group.canonicalName,
      variations: group.variations.filter(v => !variationsToSplit.includes(v))
    };

    // Create new group from split variations
    const canonicalName = this.findMostFrequent(variationsToSplit, transactions);
    const newGroup: StoreGrouping = {
      canonicalName,
      variations: variationsToSplit.filter(v => v !== canonicalName)
    };

    // Update transactions for the new group
    const updatedTransactions = transactions.map(transaction => {
      if (variationsToSplit.includes(transaction.description)) {
        return {
          ...transaction,
          description: canonicalName
        };
      }
      return transaction;
    });

    return { originalGroup, newGroup, updatedTransactions };
  }

  /**
   * Applies store name mappings to transactions
   * Updates transaction descriptions to use canonical names
   */
  static applyStoreMappings(
    transactions: Transaction[],
    mappings: { [canonicalName: string]: string[] }
  ): Transaction[] {
    // Create reverse mapping for quick lookup
    const reverseMap = new Map<string, string>();
    Object.entries(mappings).forEach(([canonical, variations]) => {
      variations.forEach(variation => {
        reverseMap.set(variation, canonical);
      });
    });

    // Update transaction descriptions
    return transactions.map(transaction => {
      const canonicalName = reverseMap.get(transaction.description);
      if (canonicalName) {
        return {
          ...transaction,
          description: canonicalName
        };
      }
      return transaction;
    });
  }
}