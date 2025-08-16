import { Router } from 'express';
import { StoreAnalysisService } from '../services/StoreAnalysisService';

const router = Router();

/**
 * Get suggested store name groupings based on similarity
 */
router.get('/suggestions', (req, res) => {
  try {
    if (!req.session.data?.transactions) {
      return res.status(400).json({
        error: 'No transaction data found. Please upload a CSV file first.'
      });
    }

    const suggestions = StoreAnalysisService.analyzeSimilarStores(
      req.session.data.transactions
    );

    res.json({ suggestions });
  } catch (error) {
    console.error('Error generating store suggestions:', error);
    res.status(500).json({ error: 'Error generating store suggestions' });
  }
});

/**
 * Apply store name mappings to transactions
 */
router.post('/mappings', (req, res) => {
  try {
    if (!req.session.data?.transactions) {
      return res.status(400).json({
        error: 'No transaction data found. Please upload a CSV file first.'
      });
    }

    const mappings = req.body;
    if (!mappings || typeof mappings !== 'object') {
      return res.status(400).json({
        error: 'Invalid mappings format. Expected object with canonical names as keys.'
      });
    }

    // Apply mappings to transactions
    const updatedTransactions = StoreAnalysisService.applyStoreMappings(
      req.session.data.transactions,
      mappings
    );

    // Update session data
    req.session.data.transactions = updatedTransactions;
    req.session.data.storeMappings = mappings;

    res.json({
      message: 'Store mappings applied successfully',
      transactionCount: updatedTransactions.length
    });
  } catch (error) {
    console.error('Error applying store mappings:', error);
    res.status(500).json({ error: 'Error applying store mappings' });
  }
});

export { router as storesRouter };