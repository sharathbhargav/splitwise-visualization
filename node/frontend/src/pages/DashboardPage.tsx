import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Filters } from '../components/dashboard/Filters';
import { SpendingTimelineChart } from '../components/dashboard/SpendingTimelineChart';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { StoreBarChart } from '../components/dashboard/StoreBarChart';
import { TransactionsTable } from '../components/dashboard/TransactionsTable';
import { getMetadata, getSpendingAnalysis } from '../services/api';
import {
  AnalysisFilters,
  DatasetMetadata,
  SpendingData,
  Transaction
} from '../types';

export const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<DatasetMetadata | null>(null);
  const [timelineData, setTimelineData] = useState<SpendingData[]>([]);
  const [categoryData, setCategoryData] = useState<SpendingData[]>([]);
  const [storeData, setStoreData] = useState<SpendingData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMetadata();
      setMetadata(data);
      await loadDashboardData({});
    } catch (err) {
      setError('Error loading data. Please try uploading your file again.');
      console.error('Error loading metadata:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async (filters: AnalysisFilters) => {
    try {
      setError(null);

      // Load timeline data
      const timeline = await getSpendingAnalysis(filters, 'time', 'day');
      setTimelineData(timeline as SpendingData[]);

      // Load category data
      const categories = await getSpendingAnalysis(filters, 'category');
      setCategoryData(categories as SpendingData[]);

      // Load store data
      const stores = await getSpendingAnalysis(filters, 'store');
      setStoreData(stores as SpendingData[]);

      // Load transactions
      const result = await getSpendingAnalysis(filters, 'transactions', undefined, 1, 10);
      if ('transactions' in result) {
        setTransactions(result.transactions);
        setTotalTransactions(result.total);
      }
    } catch (err) {
      setError('Error loading dashboard data.');
      console.error('Error loading dashboard data:', err);
    }
  };

  const handleFiltersChange = (filters: AnalysisFilters) => {
    loadDashboardData(filters);
  };

  const handlePageChange = async (page: number, pageSize: number) => {
    try {
      const result = await getSpendingAnalysis({}, 'transactions', undefined, page, pageSize);
      if ('transactions' in result) {
        setTransactions(result.transactions);
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  if (isLoading || !metadata) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Spending Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        <Box>
          <Filters metadata={metadata} onFiltersChange={handleFiltersChange} />
        </Box>

        <Box>
          <SpendingTimelineChart data={timelineData} />
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box flex={1}>
            <CategoryPieChart data={categoryData} />
          </Box>
          <Box flex={1}>
            <StoreBarChart data={storeData} />
          </Box>
        </Stack>

        <Box>
          <TransactionsTable
            transactions={transactions}
            total={totalTransactions}
            onPageChange={handlePageChange}
          />
        </Box>
      </Stack>
    </Box>
  );
};
