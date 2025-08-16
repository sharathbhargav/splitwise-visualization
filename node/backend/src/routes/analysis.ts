import { Router } from 'express';
import { AnalysisService } from '../services/AnalysisService';
import { AnalysisFilters } from '../types/Transaction';

const router = Router();

/**
 * Get metadata about the dataset for populating filters
 */
router.get('/metadata', (req, res) => {
  try {
    if (!req.session.data?.transactions) {
      return res.status(400).json({
        error: 'No transaction data found. Please upload a CSV file first.'
      });
    }

    // Only return canonical store names from confirmed mappings
    const storeMappings = req.session.data.storeMappings || {};
    const metadata = {
      ...AnalysisService.getMetadata(req.session.data.transactions, storeMappings),
      // Override stores to only include canonical names
      stores: Object.keys(storeMappings)
    };

    res.json(metadata);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Error fetching metadata' });
  }
});

/**
 * Get spending analysis based on provided filters and grouping
 */
router.get('/', (req, res) => {
  try {
    if (!req.session.data?.transactions) {
      return res.status(400).json({
        error: 'No transaction data found. Please upload a CSV file first.'
      });
    }

    // Parse query parameters
    const filters: AnalysisFilters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      people: req.query.people ? (req.query.people as string).split(',') : undefined,
      categories: req.query.categories ? (req.query.categories as string).split(',') : undefined,
      stores: req.query.stores ? (req.query.stores as string).split(',') : undefined
    };

    const groupBy = req.query.groupBy as 'time' | 'category' | 'store' | 'person';
    const timeInterval = req.query.interval as 'day' | 'week' | 'month';
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const storeMappings = req.session.data.storeMappings || {};

    let result;
    if (groupBy === 'time') {
      result = AnalysisService.getSpendingOverTime(
        req.session.data.transactions,
        filters,
        storeMappings,
        timeInterval
      );
    } else if (['category', 'store', 'person'].includes(groupBy)) {
      result = AnalysisService.getSpendingBy(
        req.session.data.transactions,
        filters,
        storeMappings,
        groupBy as 'category' | 'store' | 'person'
      );
    } else {
      // Default to detailed transactions
      result = AnalysisService.getDetailedTransactions(
        req.session.data.transactions,
        filters,
        storeMappings,
        page,
        pageSize
      );
    }

    res.json(result);
  } catch (error) {
    console.error('Error analyzing data:', error);
    res.status(500).json({ error: 'Error analyzing data' });
  }
});

export { router as analysisRouter };