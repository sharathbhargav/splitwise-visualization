/**
 * Advanced Analytics API Routes
 * Provides REST endpoints for complex spending analysis and insights
 */

import { Router } from 'express';
import { AdvancedAnalyticsService } from '../services/AdvancedAnalyticsService';

const router = Router();

/**
 * GET /api/advanced-analytics/payment-patterns
 * Returns payment pattern analysis for all people
 */
router.get('/payment-patterns', (req, res) => {
  try {
    // Check if transaction data exists in session
    if (!req.session.data?.transactions) {
      return res.status(400).json({ 
        error: 'No transaction data found. Please upload a CSV file first.' 
      });
    }

    const transactions = req.session.data.transactions;
    const storeMappings = req.session.data.storeMappings || {};

    // Get payment patterns for all people
    const paymentPatterns = AdvancedAnalyticsService.getPaymentPatterns(
      transactions, 
      storeMappings
    );

    res.json(paymentPatterns);
  } catch (error) {
    console.error('Error fetching payment patterns:', error);
    res.status(500).json({ error: 'Internal server error while analyzing payment patterns' });
  }
});

/**
 * GET /api/advanced-analytics/payment-patterns/:person
 * Returns payment pattern analysis for a specific person
 */
router.get('/payment-patterns/:person', (req, res) => {
  try {
    // Check if transaction data exists in session
    if (!req.session.data?.transactions) {
      return res.status(400).json({ 
        error: 'No transaction data found. Please upload a CSV file first.' 
      });
    }

    const personName = req.params.person;
    const transactions = req.session.data.transactions;
    const storeMappings = req.session.data.storeMappings || {};

    // Get payment patterns for all people, then filter for specific person
    const allPatterns = AdvancedAnalyticsService.getPaymentPatterns(
      transactions, 
      storeMappings
    );

    const personPattern = allPatterns.find(pattern => pattern.person === personName);

    if (!personPattern) {
      return res.status(404).json({ 
        error: `No payment pattern found for person: ${personName}` 
      });
    }

    res.json(personPattern);
  } catch (error) {
    console.error('Error fetching payment pattern for person:', error);
    res.status(500).json({ error: 'Internal server error while analyzing payment pattern' });
  }
});

/**
 * GET /api/advanced-analytics/stores
 * Returns detailed analytics for all stores
 */
router.get('/stores', (req, res) => {
  try {
    // Check if transaction data exists in session
    if (!req.session.data?.transactions) {
      return res.status(400).json({ 
        error: 'No transaction data found. Please upload a CSV file first.' 
      });
    }

    const transactions = req.session.data.transactions;
    const storeMappings = req.session.data.storeMappings || {};

    // Get store analytics
    const storeAnalytics = AdvancedAnalyticsService.getStoreAnalytics(
      transactions, 
      storeMappings
    );

    res.json(storeAnalytics);
  } catch (error) {
    console.error('Error fetching store analytics:', error);
    res.status(500).json({ error: 'Internal server error while analyzing store data' });
  }
});

/**
 * GET /api/advanced-analytics/categories/trends
 * Returns trend analysis for all spending categories
 */
router.get('/categories/trends', (req, res) => {
  try {
    // Check if transaction data exists in session
    if (!req.session.data?.transactions) {
      return res.status(400).json({ 
        error: 'No transaction data found. Please upload a CSV file first.' 
      });
    }

    const transactions = req.session.data.transactions;
    const storeMappings = req.session.data.storeMappings || {};

    // Get category trends
    const categoryTrends = AdvancedAnalyticsService.getCategoryTrends(
      transactions, 
      storeMappings
    );

    res.json(categoryTrends);
  } catch (error) {
    console.error('Error fetching category trends:', error);
    res.status(500).json({ error: 'Internal server error while analyzing category trends' });
  }
});

/**
 * GET /api/advanced-analytics/balance
 * Returns balance analytics between all people
 */
router.get('/balance', (req, res) => {
  try {
    // Check if transaction data exists in session
    if (!req.session.data?.transactions) {
      return res.status(400).json({ 
        error: 'No transaction data found. Please upload a CSV file first.' 
      });
    }

    const transactions = req.session.data.transactions;

    // Get balance analytics
    const balanceAnalytics = AdvancedAnalyticsService.getBalanceAnalytics(transactions);

    res.json(balanceAnalytics);
  } catch (error) {
    console.error('Error fetching balance analytics:', error);
    res.status(500).json({ error: 'Internal server error while analyzing balance data' });
  }
});

/**
 * GET /api/advanced-analytics/heatmap
 * Returns spending heatmap data for calendar visualization
 * Query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD (optional)
 */
router.get('/heatmap', (req, res) => {
  try {
    // Check if transaction data exists in session
    if (!req.session.data?.transactions) {
      return res.status(400).json({ 
        error: 'No transaction data found. Please upload a CSV file first.' 
      });
    }

    const transactions = req.session.data.transactions;
    
    // Parse optional date range query parameters
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    let dateRange: { start: string; end: string } | undefined;
    if (startDate && endDate) {
      // Validate date format (basic check)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ 
          error: 'Invalid date format. Use YYYY-MM-DD format.' 
        });
      }
      
      if (startDate > endDate) {
        return res.status(400).json({ 
          error: 'Start date cannot be after end date.' 
        });
      }
      
      dateRange = { start: startDate, end: endDate };
    }

    // Get spending heatmap data
    const heatmapData = AdvancedAnalyticsService.getSpendingHeatmap(
      transactions, 
      dateRange
    );

    res.json(heatmapData);
  } catch (error) {
    console.error('Error fetching spending heatmap:', error);
    res.status(500).json({ error: 'Internal server error while generating spending heatmap' });
  }
});

/**
 * GET /api/advanced-analytics/budget-intelligence
 * Returns AI-powered budget recommendations and anomaly detection
 */
router.get('/budget-intelligence', (req, res) => {
  try {
    // Check if transaction data exists in session
    if (!req.session.data?.transactions) {
      return res.status(400).json({ 
        error: 'No transaction data found. Please upload a CSV file first.' 
      });
    }

    const transactions = req.session.data.transactions;
    const storeMappings = req.session.data.storeMappings || {};

    // Get budget intelligence insights
    const budgetIntelligence = AdvancedAnalyticsService.getBudgetIntelligence(
      transactions, 
      storeMappings
    );

    res.json(budgetIntelligence);
  } catch (error) {
    console.error('Error fetching budget intelligence:', error);
    res.status(500).json({ error: 'Internal server error while analyzing budget intelligence' });
  }
});

export { router as advancedAnalyticsRouter };
