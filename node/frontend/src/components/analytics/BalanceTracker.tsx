/**
 * Balance Tracker Component
 * Displays balance analytics between users with visual charts and summaries
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Alert,
  Button,
  Skeleton,
  Chip
} from '@mui/material';
import { Grid, GridProps } from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { BalanceAnalytics } from '../../types/analytics';
import { getBalanceAnalytics } from '../../services/api';

// Color palette for consistent theming across charts
const CHART_COLORS = {
  primary: '#0088FE',
  secondary: '#00C49F',
  accent: '#FFBB28',
  warning: '#FF8042',
  success: '#82CA9D',
  error: '#FF7C43'
};

/**
 * BalanceTracker component that fetches and displays balance analytics
 * Shows current balances, historical trends, and payment patterns
 */
export const BalanceTracker: React.FC = () => {
  // Component state management
  const [data, setData] = useState<BalanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches balance analytics data from the API
   * Handles loading states and error cases
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const balanceData = await getBalanceAnalytics();
      setData(balanceData);
    } catch (err) {
      console.error('Error fetching balance analytics:', err);
      setError('Failed to load balance analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Formats currency values for display
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  /**
   * Determines the color for balance display based on amount
   */
  const getBalanceColor = (amount: number): string => {
    if (amount > 0) return CHART_COLORS.success; // Positive balance (owed money)
    if (amount < 0) return CHART_COLORS.error;   // Negative balance (owes money)
    return CHART_COLORS.primary;                 // Zero balance
  };

  /**
   * Formats balance history data for line chart
   */
  const formatBalanceHistoryData = () => {
    if (!data) return [];

    // Group balance history by date for multi-line chart
    const groupedData = new Map<string, any>();
    
    data.balanceHistory.forEach(entry => {
      if (!groupedData.has(entry.date)) {
        groupedData.set(entry.date, { date: entry.date });
      }
      groupedData.get(entry.date)![entry.person] = entry.balance;
    });

    return Array.from(groupedData.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  /**
   * Formats payment frequency data for bar chart
   */
  const formatPaymentFrequencyData = () => {
    if (!data) return [];

    return Object.entries(data.paymentFrequency).map(([person, frequency]) => ({
      person,
      frequency,
      currentBalance: data.currentBalance[person] || 0
    }));
  };

  // Loading state with skeleton placeholders
  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Balance Tracker
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={120} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Balance Tracker
        </Typography>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // No data state
  if (!data) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Balance Tracker
        </Typography>
        <Alert severity="info">
          No balance data available. Please upload transaction data first.
        </Alert>
      </Box>
    );
  }

  const balanceHistoryData = formatBalanceHistoryData();
  const paymentFrequencyData = formatPaymentFrequencyData();
  const people = Object.keys(data.currentBalance);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Balance Tracker
      </Typography>

      {/* Current Balance Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid {...{ item: true, xs: 12 } as any}>
          <Typography variant="h6" gutterBottom>
            Current Balances
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(data.currentBalance).map(([person, balance]) => (
              <Grid item xs={12} sm={6} md={4} key={person}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {person}
                    </Typography>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        color: getBalanceColor(balance),
                        fontWeight: 'bold',
                        mt: 1
                      }}
                    >
                      {formatCurrency(balance)}
                    </Typography>
                    <Chip 
                      label={balance > 0 ? 'Owed Money' : balance < 0 ? 'Owes Money' : 'Even'}
                      color={balance > 0 ? 'success' : balance < 0 ? 'error' : 'default'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Balance History Line Chart */}
      {balanceHistoryData.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Running Balance Over Time
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={balanceHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      labelFormatter={(value) => `Date: ${value}`}
                      formatter={(value: number, name: string) => [
                        formatCurrency(value), 
                        name
                      ]}
                    />
                    <Legend />
                    {people.map((person, index) => (
                      <Line
                        key={person}
                        type="monotone"
                        dataKey={person}
                        stroke={Object.values(CHART_COLORS)[index % Object.keys(CHART_COLORS).length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Payment Frequency Bar Chart */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Payment Frequency
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={paymentFrequencyData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="person" 
                      tick={{ fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value} transactions`, 'Frequency']}
                    />
                    <Bar 
                      dataKey="frequency" 
                      fill={CHART_COLORS.primary}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Monthly Balance Changes */}
      {data.monthlyBalanceChange.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Balance Activity
              </Typography>
              <Box sx={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={data.monthlyBalanceChange}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Activity']}
                      labelFormatter={(value) => `Month: ${value}`}
                    />
                    <Bar 
                      dataKey="change" 
                      fill={CHART_COLORS.accent}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Largest Imbalance Period Info */}
      {data.largestImbalancePeriod.maxImbalance > 0 && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="subtitle1" gutterBottom>
                Largest Imbalance Period
              </Typography>
              <Typography variant="body2">
                The largest imbalance of {formatCurrency(data.largestImbalancePeriod.maxImbalance)} 
                occurred on {data.largestImbalancePeriod.start}
                {data.largestImbalancePeriod.start !== data.largestImbalancePeriod.end && 
                  ` to ${data.largestImbalancePeriod.end}`
                }.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
