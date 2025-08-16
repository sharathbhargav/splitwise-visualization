/**
 * Spending Heatmap Component
 * Displays a calendar-style heatmap showing daily spending patterns
 * Allows users to visualize spending intensity over time
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Card,
  CardContent,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay } from 'date-fns';
import { SpendingHeatmap as SpendingHeatmapData } from '../../types/analytics';
import { getSpendingHeatmap } from '../../services/api';

// Color intensity levels for heatmap visualization
const HEATMAP_COLORS = {
  0: '#f3f4f6',     // No spending - light gray
  1: '#dcfce7',     // Low spending - light green
  2: '#bbf7d0',     // Low-medium spending
  3: '#86efac',     // Medium spending
  4: '#4ade80',     // Medium-high spending
  5: '#22c55e',     // High spending
  6: '#16a34a',     // Very high spending - dark green
};

/**
 * SpendingHeatmap component that displays calendar-style spending visualization
 */
export const SpendingHeatmap: React.FC = () => {
  // Component state management
  const [data, setData] = useState<SpendingHeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('last6months');
  const [selectedDay, setSelectedDay] = useState<SpendingHeatmapData | null>(null);

  /**
   * Calculates date range based on selected period
   */
  const getDateRange = (period: string) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    switch (period) {
      case 'last3months':
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        return {
          start: format(threeMonthsAgo, 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd')
        };
      case 'last6months':
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        return {
          start: format(sixMonthsAgo, 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd')
        };
      case 'thisyear':
        return {
          start: format(startOfYear(now), 'yyyy-MM-dd'),
          end: format(endOfYear(now), 'yyyy-MM-dd')
        };
      case 'lastyear':
        const lastYear = new Date(currentYear - 1, 0, 1);
        return {
          start: format(startOfYear(lastYear), 'yyyy-MM-dd'),
          end: format(endOfYear(lastYear), 'yyyy-MM-dd')
        };
      default:
        return undefined;
    }
  };

  /**
   * Fetches spending heatmap data from the API
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dateRange = getDateRange(selectedPeriod);
      const heatmapData = await getSpendingHeatmap(
        dateRange?.start,
        dateRange?.end
      );
      
      setData(heatmapData);
    } catch (err) {
      console.error('Error fetching spending heatmap:', err);
      setError('Failed to load spending heatmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or period changes
  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  /**
   * Handles period selection change
   */
  const handlePeriodChange = (event: SelectChangeEvent<string>) => {
    setSelectedPeriod(event.target.value);
    setSelectedDay(null); // Clear selected day when changing period
  };

  /**
   * Determines color intensity based on spending amount
   */
  const getIntensityLevel = (amount: number, maxAmount: number): number => {
    if (amount === 0) return 0;
    const ratio = amount / maxAmount;
    if (ratio <= 0.1) return 1;
    if (ratio <= 0.2) return 2;
    if (ratio <= 0.4) return 3;
    if (ratio <= 0.6) return 4;
    if (ratio <= 0.8) return 5;
    return 6;
  };

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
   * Creates calendar grid structure
   */
  const createCalendarGrid = () => {
    if (!data.length) return [];

    const maxAmount = Math.max(...data.map(d => d.amount));
    const dataMap = new Map(data.map(d => [d.date, d]));
    
    // Get all dates in the range
    const firstDate = new Date(data[0].date);
    const lastDate = new Date(data[data.length - 1].date);
    
    const allDates = eachDayOfInterval({
      start: firstDate,
      end: lastDate
    });

    // Group by weeks
    const weeks: Array<Array<{ date: Date; data?: SpendingHeatmapData }>> = [];
    let currentWeek: Array<{ date: Date; data?: SpendingHeatmapData }> = [];

    allDates.forEach(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      const dayOfWeek = getDay(date);
      
      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push({
        date,
        data: dataMap.get(dateString)
      });
    });
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks.map(week => ({
      week,
      maxAmount
    }));
  };

  const calendarData = createCalendarGrid();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Spending Calendar Heatmap
        </Typography>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading spending heatmap...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Spending Calendar Heatmap
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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Spending Calendar Heatmap
      </Typography>

      {/* Period Selector */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={selectedPeriod}
            label="Time Period"
            onChange={handlePeriodChange}
          >
            <MenuItem value="last3months">Last 3 Months</MenuItem>
            <MenuItem value="last6months">Last 6 Months</MenuItem>
            <MenuItem value="thisyear">This Year</MenuItem>
            <MenuItem value="lastyear">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {data.length === 0 ? (
        <Alert severity="info">
          No spending data available for the selected period.
        </Alert>
      ) : (
        <>
          {/* Calendar Grid */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={1}>
              {/* Day headers */}
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  {dayNames.map(day => (
                    <Grid item xs={1.71} key={day}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: 'text.secondary'
                        }}
                      >
                        {day}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Calendar weeks */}
              {calendarData.map(({ week, maxAmount }, weekIndex) => (
                <Grid item xs={12} key={weekIndex}>
                  <Grid container spacing={1}>
                    {week.map(({ date, data: dayData }, dayIndex) => {
                      const amount = dayData?.amount || 0;
                      const intensityLevel = getIntensityLevel(amount, maxAmount);
                      const isSelected = selectedDay?.date === format(date, 'yyyy-MM-dd');
                      
                      return (
                        <Grid item xs={1.71} key={dayIndex}>
                          <Tooltip
                            title={
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {format(date, 'MMM dd, yyyy')}
                                </Typography>
                                <Typography variant="body2">
                                  Spent: {formatCurrency(amount)}
                                </Typography>
                                {dayData && (
                                  <>
                                    <Typography variant="body2">
                                      Transactions: {dayData.transactionCount}
                                    </Typography>
                                    {dayData.categories.length > 0 && (
                                      <Typography variant="body2">
                                        Categories: {dayData.categories.join(', ')}
                                      </Typography>
                                    )}
                                  </>
                                )}
                              </Box>
                            }
                          >
                            <Box
                              sx={{
                                width: '100%',
                                height: 20,
                                backgroundColor: HEATMAP_COLORS[intensityLevel as keyof typeof HEATMAP_COLORS],
                                border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                borderRadius: 1,
                                cursor: amount > 0 ? 'pointer' : 'default',
                                transition: 'all 0.2s ease',
                                '&:hover': amount > 0 ? {
                                  transform: 'scale(1.1)',
                                  zIndex: 1,
                                  boxShadow: 1
                                } : {}
                              }}
                              onClick={() => {
                                if (dayData) {
                                  setSelectedDay(isSelected ? null : dayData);
                                }
                              }}
                            />
                          </Tooltip>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Grid>
              ))}
            </Grid>

            {/* Color Legend */}
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ mr: 1 }}>
                Less
              </Typography>
              {Object.entries(HEATMAP_COLORS).map(([level, color]) => (
                <Box
                  key={level}
                  sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: color,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1
                  }}
                />
              ))}
              <Typography variant="caption" sx={{ ml: 1 }}>
                More
              </Typography>
            </Box>
          </Paper>

          {/* Selected Day Details */}
          {selectedDay && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {format(new Date(selectedDay.date), 'EEEE, MMMM dd, yyyy')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total Spent
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(selectedDay.amount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Transactions
                    </Typography>
                    <Typography variant="h5">
                      {selectedDay.transactionCount}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Categories
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedDay.categories.map(category => (
                        <Chip
                          key={category}
                          label={category}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Summary Statistics */}
          {data.length > 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Total Days with Spending
                    </Typography>
                    <Typography variant="h6">
                      {data.filter(d => d.amount > 0).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Average Daily Spending
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(
                        data.reduce((sum, d) => sum + d.amount, 0) / data.length
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Highest Single Day
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(Math.max(...data.map(d => d.amount)))}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Total Period Spending
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(
                        data.reduce((sum, d) => sum + d.amount, 0)
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};
