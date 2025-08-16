/**
 * Advanced Analytics Page
 * Main page for advanced spending analytics with tabbed interface
 * Provides access to balance tracking, spending patterns, store analytics, and more
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Chip
} from '@mui/material';
import {
  AccountBalance as BalanceIcon,
  CalendarViewMonth as HeatmapIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  Psychology as IntelligenceIcon,
  Person as PersonIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { BalanceTracker } from '../components/analytics/BalanceTracker';
import { SpendingHeatmap } from '../components/analytics/SpendingHeatmap';
import { 
  getPaymentPatterns, 
  getStoreAnalytics, 
  getCategoryTrends, 
  getBudgetIntelligence 
} from '../services/api';
import {
  PaymentPattern,
  StoreAnalytics,
  CategoryTrend,
  BudgetIntelligence
} from '../types/analytics';

// Tab interface for type safety
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * TabPanel component for managing tab content visibility
 */
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

/**
 * Overview component showing summary cards
 */
const OverviewTab: React.FC = () => {
  const [paymentPatterns, setPaymentPatterns] = useState<PaymentPattern[]>([]);
  const [storeAnalytics, setStoreAnalytics] = useState<StoreAnalytics[]>([]);
  const [categoryTrends, setCategoryTrends] = useState<CategoryTrend[]>([]);
  const [budgetIntelligence, setBudgetIntelligence] = useState<BudgetIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [patterns, stores, categories, intelligence] = await Promise.all([
        getPaymentPatterns(),
        getStoreAnalytics(),
        getCategoryTrends(),
        getBudgetIntelligence()
      ]);

      setPaymentPatterns(patterns);
      setStoreAnalytics(stores);
      setCategoryTrends(categories);
      setBudgetIntelligence(intelligence);
    } catch (err) {
      console.error('Error loading overview data:', err);
      setError('Failed to load analytics overview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2, mt: 1 }}>
          Loading analytics overview...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={loadOverviewData}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Payment Patterns Summary */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Payment Patterns</Typography>
            </Box>
            {paymentPatterns.length > 0 ? (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Active Users: {paymentPatterns.length}
                </Typography>
                {paymentPatterns.slice(0, 3).map(pattern => (
                  <Box key={pattern.person} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">{pattern.person}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg. Transaction: {formatCurrency(pattern.averageTransactionSize)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No payment pattern data available
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Store Analytics Summary */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StoreIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Store Analytics</Typography>
            </Box>
            {storeAnalytics.length > 0 ? (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tracked Stores: {storeAnalytics.length}
                </Typography>
                {storeAnalytics.slice(0, 3).map(store => (
                  <Box key={store.storeName} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">{store.storeName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: {formatCurrency(store.totalSpent)} • Visits: {store.visitFrequency}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No store analytics available
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Category Trends Summary */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CategoryIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Category Trends</Typography>
            </Box>
            {categoryTrends.length > 0 ? (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Categories: {categoryTrends.length}
                </Typography>
                {categoryTrends.slice(0, 3).map(trend => (
                  <Box key={trend.category} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">{trend.category}</Typography>
                      <Chip
                        size="small"
                        label={`${trend.growthRate > 0 ? '+' : ''}${trend.growthRate.toFixed(1)}%`}
                        color={trend.growthRate > 0 ? 'error' : trend.growthRate < 0 ? 'success' : 'default'}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Avg: {formatCurrency(trend.averageTransactionSize)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No category trend data available
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Budget Intelligence Summary */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IntelligenceIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Budget Intelligence</Typography>
            </Box>
            {budgetIntelligence ? (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Recommendations: {budgetIntelligence.categoryRecommendations.length}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Anomalies Detected: {budgetIntelligence.anomalies.length}
                </Typography>
                {budgetIntelligence.categoryRecommendations.slice(0, 2).map(rec => (
                  <Box key={rec.category} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">{rec.category}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Suggested Budget: {formatCurrency(rec.suggestedBudget)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No budget intelligence available
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

/**
 * Simple component wrappers for analytics data display
 */
const PaymentPatternsTab: React.FC = () => {
  const [data, setData] = useState<PaymentPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPaymentPatterns()
      .then(setData)
      .catch(() => setError('Failed to load payment patterns'))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Grid container spacing={3}>
      {data.map(pattern => (
        <Grid item xs={12} md={6} key={pattern.person}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{pattern.person}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Average Transaction: {formatCurrency(pattern.averageTransactionSize)}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>Top Categories:</Typography>
              {Object.entries(pattern.categoryBreakdown)
                .sort(([,a], [,b]) => b.amount - a.amount)
                .slice(0, 3)
                .map(([category, data]) => (
                  <Typography key={category} variant="body2">
                    {category}: {formatCurrency(data.amount)} ({data.count} transactions)
                  </Typography>
                ))
              }
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Main AdvancedAnalyticsPage component
 */
export const AdvancedAnalyticsPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const tabs = [
    { label: 'Overview', icon: <AnalyticsIcon /> },
    { label: 'Balance Tracker', icon: <BalanceIcon /> },
    { label: 'Spending Heatmap', icon: <HeatmapIcon /> },
    { label: 'Payment Patterns', icon: <PersonIcon /> },
    { label: 'Budget Intelligence', icon: <IntelligenceIcon /> }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Advanced Analytics
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Deep insights into your spending patterns, balances, and financial trends
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              id={`analytics-tab-${index}`}
              aria-controls={`analytics-tabpanel-${index}`}
            />
          ))}
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <OverviewTab />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <BalanceTracker />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <SpendingHeatmap />
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <PaymentPatternsTab />
        </TabPanel>

        <TabPanel value={currentTab} index={4}>
          <Box sx={{ p: 2 }}>
            <Alert severity="info">
              Budget Intelligence feature coming soon! This will include AI-powered budget recommendations, 
              anomaly detection, and spending predictions.
            </Alert>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};
