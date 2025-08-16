/**
 * Advanced Analytics Service
 * Provides sophisticated spending analysis and pattern recognition
 */

import { 
  format, 
  getWeek, 
  getDayOfYear, 
  startOfMonth, 
  endOfMonth, 
  differenceInMonths,
  parseISO,
  getDay
} from 'date-fns';
import { Transaction } from '../types/Transaction';
import {
  PaymentPattern,
  StoreAnalytics,
  CategoryTrend,
  BalanceAnalytics,
  SpendingHeatmap,
  BudgetIntelligence
} from '../types/Analytics';

export class AdvancedAnalyticsService {
  
  /**
   * Creates a reverse mapping from store variations to their canonical names
   * Used throughout the service to normalize store names
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
   * Gets the canonical store name for a transaction description
   */
  private static getCanonicalStoreName(description: string, storeMapping: Map<string, string>): string {
    return storeMapping.get(description) || description;
  }

  /**
   * Converts day number to day name
   */
  private static getDayName(dayNumber: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  }

  /**
   * Analyzes payment patterns for each person in the transactions
   * Provides insights into individual spending behavior and preferences
   * 
   * @param transactions - Array of all transactions to analyze
   * @param storeMappings - Store name mappings for normalization
   * @returns Array of payment patterns for each person
   */
  static getPaymentPatterns(
    transactions: Transaction[], 
    storeMappings: { [canonical: string]: string[] }
  ): PaymentPattern[] {
    try {
      const storeMapping = this.createStoreMapping(storeMappings);
      const personMap = new Map<string, PaymentPattern>();

      // Initialize pattern data for each person
      transactions.forEach(transaction => {
        transaction.shares.forEach(share => {
          if (!personMap.has(share.name)) {
            personMap.set(share.name, {
              person: share.name,
              categoryBreakdown: {},
              preferredStores: [],
              averageTransactionSize: 0,
              paymentFrequency: {},
              monthlySpending: {}
            });
          }
        });
      });

      // Accumulate data for each person
      transactions.forEach(transaction => {
        const canonicalStore = this.getCanonicalStoreName(transaction.description, storeMapping);
        const transactionDate = parseISO(transaction.date);
        const dayOfWeek = this.getDayName(getDay(transactionDate));
        const month = format(transactionDate, 'yyyy-MM');

        transaction.shares.forEach(share => {
          const pattern = personMap.get(share.name)!;
          
          // Update category breakdown
          if (!pattern.categoryBreakdown[transaction.category]) {
            pattern.categoryBreakdown[transaction.category] = { amount: 0, count: 0 };
          }
          pattern.categoryBreakdown[transaction.category].amount += Math.abs(share.amount);
          pattern.categoryBreakdown[transaction.category].count += 1;

          // Update payment frequency by day of week
          pattern.paymentFrequency[dayOfWeek] = (pattern.paymentFrequency[dayOfWeek] || 0) + 1;

          // Update monthly spending
          pattern.monthlySpending[month] = (pattern.monthlySpending[month] || 0) + Math.abs(share.amount);
        });
      });

      // Calculate derived metrics for each person
      return Array.from(personMap.values()).map(pattern => {
        // Calculate preferred stores
        const storeData = new Map<string, { frequency: number; totalSpent: number }>();
        
        transactions.forEach(transaction => {
          const canonicalStore = this.getCanonicalStoreName(transaction.description, storeMapping);
          const personShare = transaction.shares.find(s => s.name === pattern.person);
          
          if (personShare) {
            if (!storeData.has(canonicalStore)) {
              storeData.set(canonicalStore, { frequency: 0, totalSpent: 0 });
            }
            const data = storeData.get(canonicalStore)!;
            data.frequency += 1;
            data.totalSpent += Math.abs(personShare.amount);
          }
        });

        pattern.preferredStores = Array.from(storeData.entries())
          .map(([store, data]) => ({ store, ...data }))
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 10); // Top 10 stores

        // Calculate average transaction size
        const personTransactions = transactions.filter(t => 
          t.shares.some(s => s.name === pattern.person)
        );
        const totalSpent = Object.values(pattern.categoryBreakdown)
          .reduce((sum, cat) => sum + cat.amount, 0);
        pattern.averageTransactionSize = personTransactions.length > 0 
          ? totalSpent / personTransactions.length 
          : 0;

        return pattern;
      });
    } catch (error) {
      console.error('Error calculating payment patterns:', error);
      return [];
    }
  }

  /**
   * Provides detailed analytics for each store
   * Analyzes visit patterns, spending trends, and popularity metrics
   * 
   * @param transactions - Array of all transactions to analyze
   * @param storeMappings - Store name mappings for normalization
   * @returns Array of store analytics
   */
  static getStoreAnalytics(
    transactions: Transaction[], 
    storeMappings: { [canonical: string]: string[] }
  ): StoreAnalytics[] {
    try {
      const storeMapping = this.createStoreMapping(storeMappings);
      const storeMap = new Map<string, StoreAnalytics>();

      // Group transactions by canonical store name
      transactions.forEach(transaction => {
        const canonicalStore = this.getCanonicalStoreName(transaction.description, storeMapping);
        
        if (!storeMap.has(canonicalStore)) {
          storeMap.set(canonicalStore, {
            storeName: canonicalStore,
            visitFrequency: 0,
            averageSpend: 0,
            totalSpent: 0,
            popularDays: [],
            categories: [],
            firstVisited: transaction.date,
            lastVisited: transaction.date,
            monthlyTrend: []
          });
        }

        const analytics = storeMap.get(canonicalStore)!;
        analytics.visitFrequency += 1;
        analytics.totalSpent += transaction.cost;
        
        // Update date range
        if (transaction.date < analytics.firstVisited) {
          analytics.firstVisited = transaction.date;
        }
        if (transaction.date > analytics.lastVisited) {
          analytics.lastVisited = transaction.date;
        }
      });

      // Calculate derived metrics for each store
      return Array.from(storeMap.values()).map(analytics => {
        const storeTransactions = transactions.filter(t => 
          this.getCanonicalStoreName(t.description, storeMapping) === analytics.storeName
        );

        // Calculate average spend
        analytics.averageSpend = analytics.visitFrequency > 0 
          ? analytics.totalSpent / analytics.visitFrequency 
          : 0;

        // Get unique categories
        analytics.categories = [...new Set(storeTransactions.map(t => t.category))];

        // Calculate popular days
        const dayCount = new Map<string, number>();
        storeTransactions.forEach(transaction => {
          const dayOfWeek = this.getDayName(getDay(parseISO(transaction.date)));
          dayCount.set(dayOfWeek, (dayCount.get(dayOfWeek) || 0) + 1);
        });
        
        analytics.popularDays = Array.from(dayCount.entries())
          .map(([day, frequency]) => ({ day, frequency }))
          .sort((a, b) => b.frequency - a.frequency);

        // Calculate monthly trend
        const monthlyData = new Map<string, { amount: number; visits: number }>();
        storeTransactions.forEach(transaction => {
          const month = format(parseISO(transaction.date), 'yyyy-MM');
          if (!monthlyData.has(month)) {
            monthlyData.set(month, { amount: 0, visits: 0 });
          }
          const data = monthlyData.get(month)!;
          data.amount += transaction.cost;
          data.visits += 1;
        });

        analytics.monthlyTrend = Array.from(monthlyData.entries())
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month));

        return analytics;
      }).sort((a, b) => b.totalSpent - a.totalSpent);
    } catch (error) {
      console.error('Error calculating store analytics:', error);
      return [];
    }
  }

  /**
   * Analyzes trends for each spending category
   * Identifies growth patterns, transaction characteristics, and store preferences
   * 
   * @param transactions - Array of all transactions to analyze
   * @param storeMappings - Store name mappings for normalization
   * @returns Array of category trends
   */
  static getCategoryTrends(
    transactions: Transaction[], 
    storeMappings: { [canonical: string]: string[] }
  ): CategoryTrend[] {
    try {
      const storeMapping = this.createStoreMapping(storeMappings);
      const categoryMap = new Map<string, CategoryTrend>();

      // Initialize category data
      const categories = [...new Set(transactions.map(t => t.category))];
      categories.forEach(category => {
        const categoryTransactions = transactions.filter(t => t.category === category);
        if (categoryTransactions.length === 0) return;

        // Find largest and smallest transactions
        const sortedByAmount = [...categoryTransactions].sort((a, b) => b.cost - a.cost);
        
        categoryMap.set(category, {
          category,
          monthlySpend: [],
          growthRate: 0,
          largestTransaction: sortedByAmount[0],
          smallestTransaction: sortedByAmount[sortedByAmount.length - 1],
          averageTransactionSize: 0,
          commonStores: [],
          dayOfWeekPattern: {}
        });
      });

      // Calculate monthly spending and other metrics
      categoryMap.forEach((trend, category) => {
        const categoryTransactions = transactions.filter(t => t.category === category);
        
        // Monthly spending calculation
        const monthlyData = new Map<string, { amount: number; count: number }>();
        categoryTransactions.forEach(transaction => {
          const month = format(parseISO(transaction.date), 'yyyy-MM');
          if (!monthlyData.has(month)) {
            monthlyData.set(month, { amount: 0, count: 0 });
          }
          const data = monthlyData.get(month)!;
          data.amount += transaction.cost;
          data.count += 1;
        });

        trend.monthlySpend = Array.from(monthlyData.entries())
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month));

        // Calculate growth rate (last 3 months average vs previous 3 months)
        if (trend.monthlySpend.length >= 6) {
          const recentMonths = trend.monthlySpend.slice(-3);
          const previousMonths = trend.monthlySpend.slice(-6, -3);
          
          const recentAvg = recentMonths.reduce((sum, m) => sum + m.amount, 0) / 3;
          const previousAvg = previousMonths.reduce((sum, m) => sum + m.amount, 0) / 3;
          
          trend.growthRate = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
        }

        // Average transaction size
        const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.cost, 0);
        trend.averageTransactionSize = categoryTransactions.length > 0 
          ? totalAmount / categoryTransactions.length 
          : 0;

        // Common stores for this category
        const storeData = new Map<string, { amount: number; frequency: number }>();
        categoryTransactions.forEach(transaction => {
          const canonicalStore = this.getCanonicalStoreName(transaction.description, storeMapping);
          if (!storeData.has(canonicalStore)) {
            storeData.set(canonicalStore, { amount: 0, frequency: 0 });
          }
          const data = storeData.get(canonicalStore)!;
          data.amount += transaction.cost;
          data.frequency += 1;
        });

        trend.commonStores = Array.from(storeData.entries())
          .map(([store, data]) => ({ store, ...data }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5); // Top 5 stores

        // Day of week pattern
        categoryTransactions.forEach(transaction => {
          const dayOfWeek = this.getDayName(getDay(parseISO(transaction.date)));
          trend.dayOfWeekPattern[dayOfWeek] = (trend.dayOfWeekPattern[dayOfWeek] || 0) + transaction.cost;
        });
      });

      return Array.from(categoryMap.values())
        .sort((a, b) => {
          const aTotal = a.monthlySpend.reduce((sum, m) => sum + m.amount, 0);
          const bTotal = b.monthlySpend.reduce((sum, m) => sum + m.amount, 0);
          return bTotal - aTotal;
        });
    } catch (error) {
      console.error('Error calculating category trends:', error);
      return [];
    }
  }

  /**
   * Tracks balance between people over time
   * Calculates who owes what to whom and identifies imbalance periods
   * 
   * @param transactions - Array of all transactions to analyze
   * @returns Balance analytics data
   */
  static getBalanceAnalytics(transactions: Transaction[]): BalanceAnalytics {
    try {
      const currentBalance: { [person: string]: number } = {};
      const balanceHistory: { date: string; balance: number; person: string }[] = [];
      const paymentFrequency: { [person: string]: number } = {};
      
      // Sort transactions by date for chronological processing
      const sortedTransactions = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
      
      // Track running balances
      const runningBalances: { [person: string]: number } = {};
      
      sortedTransactions.forEach(transaction => {
        transaction.shares.forEach(share => {
          // Initialize if needed
          if (!(share.name in runningBalances)) {
            runningBalances[share.name] = 0;
            paymentFrequency[share.name] = 0;
          }
          
          // Update running balance (positive means person is owed money, negative means they owe)
          runningBalances[share.name] += share.amount;
          paymentFrequency[share.name] += 1;
          
          // Record balance history
          balanceHistory.push({
            date: transaction.date,
            balance: runningBalances[share.name],
            person: share.name
          });
        });
      });

      // Set current balances
      Object.assign(currentBalance, runningBalances);

      // Calculate monthly balance changes
      const monthlyChanges = new Map<string, { [person: string]: number }>();
      sortedTransactions.forEach(transaction => {
        const month = format(parseISO(transaction.date), 'yyyy-MM');
        if (!monthlyChanges.has(month)) {
          monthlyChanges.set(month, {});
        }
        
        transaction.shares.forEach(share => {
          const monthData = monthlyChanges.get(month)!;
          monthData[share.name] = (monthData[share.name] || 0) + share.amount;
        });
      });

      const monthlyBalanceChange: { month: string; change: number }[] = [];
      monthlyChanges.forEach((changes, month) => {
        const totalChange = Object.values(changes).reduce((sum, change) => sum + Math.abs(change), 0);
        monthlyBalanceChange.push({ month, change: totalChange });
      });
      monthlyBalanceChange.sort((a, b) => a.month.localeCompare(b.month));

      // Find largest imbalance period
      let largestImbalancePeriod = {
        start: sortedTransactions[0]?.date || '',
        end: sortedTransactions[sortedTransactions.length - 1]?.date || '',
        maxImbalance: 0
      };

      if (balanceHistory.length > 0) {
        // Group by date to find maximum imbalance each day
        const dailyImbalances = new Map<string, number>();
        balanceHistory.forEach(record => {
          const currentMax = dailyImbalances.get(record.date) || 0;
          dailyImbalances.set(record.date, Math.max(currentMax, Math.abs(record.balance)));
        });

        // Find the period with maximum imbalance
        const maxImbalance = Math.max(...dailyImbalances.values());
        const maxImbalanceDate = Array.from(dailyImbalances.entries())
          .find(([_, imbalance]) => imbalance === maxImbalance)?.[0];

        if (maxImbalanceDate) {
          largestImbalancePeriod = {
            start: maxImbalanceDate,
            end: maxImbalanceDate,
            maxImbalance
          };
        }
      }

      return {
        currentBalance,
        balanceHistory,
        monthlyBalanceChange,
        paymentFrequency,
        largestImbalancePeriod
      };
    } catch (error) {
      console.error('Error calculating balance analytics:', error);
      return {
        currentBalance: {},
        balanceHistory: [],
        monthlyBalanceChange: [],
        paymentFrequency: {},
        largestImbalancePeriod: { start: '', end: '', maxImbalance: 0 }
      };
    }
  }

  /**
   * Creates spending heatmap data for calendar visualization
   * Groups transactions by date with additional calendar metadata
   * 
   * @param transactions - Array of all transactions to analyze
   * @param dateRange - Optional date range filter
   * @returns Array of spending heatmap data points
   */
  static getSpendingHeatmap(
    transactions: Transaction[], 
    dateRange?: { start: string; end: string }
  ): SpendingHeatmap[] {
    try {
      let filteredTransactions = transactions;
      
      // Apply date range filter if provided
      if (dateRange) {
        filteredTransactions = transactions.filter(t => 
          t.date >= dateRange.start && t.date <= dateRange.end
        );
      }

      // Group transactions by date
      const dailyData = new Map<string, SpendingHeatmap>();
      
      filteredTransactions.forEach(transaction => {
        if (!dailyData.has(transaction.date)) {
          const transactionDate = parseISO(transaction.date);
          dailyData.set(transaction.date, {
            date: transaction.date,
            amount: 0,
            transactionCount: 0,
            categories: [],
            dayOfWeek: this.getDayName(getDay(transactionDate)),
            weekOfYear: getWeek(transactionDate)
          });
        }

        const dayData = dailyData.get(transaction.date)!;
        dayData.amount += transaction.cost;
        dayData.transactionCount += 1;
        
        // Add category if not already present
        if (!dayData.categories.includes(transaction.category)) {
          dayData.categories.push(transaction.category);
        }
      });

      return Array.from(dailyData.values())
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error creating spending heatmap:', error);
      return [];
    }
  }

  /**
   * Provides budget recommendations and anomaly detection
   * Uses statistical analysis to suggest budgets and identify unusual spending
   * 
   * @param transactions - Array of all transactions to analyze
   * @param storeMappings - Store name mappings for normalization
   * @returns Budget intelligence insights
   */
  static getBudgetIntelligence(
    transactions: Transaction[], 
    storeMappings: { [canonical: string]: string[] }
  ): BudgetIntelligence {
    try {
      const categoryRecommendations: BudgetIntelligence['categoryRecommendations'] = [];
      const anomalies: BudgetIntelligence['anomalies'] = [];
      const predictedNextMonthSpending: BudgetIntelligence['predictedNextMonthSpending'] = [];

      // Calculate category recommendations
      const categories = [...new Set(transactions.map(t => t.category))];
      
      categories.forEach(category => {
        const categoryTransactions = transactions.filter(t => t.category === category);
        if (categoryTransactions.length === 0) return;

        // Calculate monthly averages
        const monthlyData = new Map<string, number>();
        categoryTransactions.forEach(transaction => {
          const month = format(parseISO(transaction.date), 'yyyy-MM');
          monthlyData.set(month, (monthlyData.get(month) || 0) + transaction.cost);
        });

        const monthlyAmounts = Array.from(monthlyData.values());
        const currentMonthlyAverage = monthlyAmounts.length > 0 
          ? monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length 
          : 0;

        // Determine trend
        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        if (monthlyAmounts.length >= 3) {
          const recent = monthlyAmounts.slice(-2).reduce((sum, a) => sum + a, 0) / 2;
          const older = monthlyAmounts.slice(-4, -2).reduce((sum, a) => sum + a, 0) / 2;
          
          if (recent > older * 1.1) trend = 'increasing';
          else if (recent < older * 0.9) trend = 'decreasing';
        }

        // Calculate suggested budget (add 20% buffer to average)
        const suggestedBudget = currentMonthlyAverage * 1.2;
        
        // Calculate confidence based on data consistency
        const variance = monthlyAmounts.length > 1 
          ? monthlyAmounts.reduce((sum, amount) => sum + Math.pow(amount - currentMonthlyAverage, 2), 0) / monthlyAmounts.length
          : 0;
        const confidence = Math.max(0, Math.min(1, 1 - (Math.sqrt(variance) / currentMonthlyAverage)));

        categoryRecommendations.push({
          category,
          suggestedBudget,
          currentMonthlyAverage,
          trend,
          confidence
        });

        // Predict next month spending based on trend
        let predictedAmount = currentMonthlyAverage;
        if (trend === 'increasing') predictedAmount *= 1.1;
        else if (trend === 'decreasing') predictedAmount *= 0.9;

        predictedNextMonthSpending.push({
          category,
          predictedAmount,
          confidence
        });
      });

      // Detect anomalies
      categories.forEach(category => {
        const categoryTransactions = transactions.filter(t => t.category === category);
        if (categoryTransactions.length < 5) return; // Need sufficient data

        const amounts = categoryTransactions.map(t => t.cost);
        const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
        const stdDev = Math.sqrt(amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length);

        // Find transactions that are more than 2 standard deviations from mean
        categoryTransactions.forEach(transaction => {
          const zScore = Math.abs((transaction.cost - mean) / stdDev);
          
          if (zScore > 2) {
            anomalies.push({
              transaction,
              anomalyType: 'unusually_high',
              score: zScore
            });
          }
        });
      });

      // Sort anomalies by score
      anomalies.sort((a, b) => b.score - a.score);

      return {
        categoryRecommendations: categoryRecommendations.sort((a, b) => b.currentMonthlyAverage - a.currentMonthlyAverage),
        anomalies: anomalies.slice(0, 10), // Top 10 anomalies
        predictedNextMonthSpending: predictedNextMonthSpending.sort((a, b) => b.predictedAmount - a.predictedAmount)
      };
    } catch (error) {
      console.error('Error calculating budget intelligence:', error);
      return {
        categoryRecommendations: [],
        anomalies: [],
        predictedNextMonthSpending: []
      };
    }
  }
}
