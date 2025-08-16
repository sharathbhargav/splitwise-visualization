# LLM Code Generation Instructions: Advanced Analytics for Spending Analyzer

## Context
You are implementing advanced analytics features for an existing Node.js/TypeScript + React spending analyzer application. The application currently processes CSV files with transaction data and provides basic visualizations.

## Existing Project Structure
```
node/
├── backend/
│   ├── src/
│   │   ├── types/Transaction.ts (contains Transaction interface)
│   │   ├── services/AnalysisService.ts (existing basic analytics)
│   │   ├── routes/analysis.ts (existing API endpoints)
│   │   └── index.ts (Express server)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── types/index.ts (frontend types)
│   │   ├── services/api.ts (API calls)
│   │   ├── pages/DashboardPage.tsx (existing dashboard)
│   │   └── components/dashboard/ (existing charts)
│   └── package.json
```

## Data Structure (CSV Format)
```csv
Date,Description,Category,Cost,Currency,Sharath S Bhargav,Surabhi
2025-02-24,Mayuri,Groceries,42.56,USD,21.28,-21.28
2025-02-25,Marshall,Household supplies,27.62,USD,13.81,-13.81
```

## Existing Transaction Interface
```typescript
interface Transaction {
  date: string;
  description: string;
  category: string;
  cost: number;
  currency: string;
  shares: { [person: string]: number };
}
```

## STEP-BY-STEP IMPLEMENTATION INSTRUCTIONS

### STEP 1: CREATE ADVANCED ANALYTICS TYPES
**File to create:** `node/backend/src/types/Analytics.ts`

**Requirements:**
- Define TypeScript interfaces for all analytics data structures
- Include proper JSDoc comments for each interface
- Ensure compatibility with existing Transaction interface
- Follow existing code style conventions

**Specific interfaces to implement:**
```typescript
interface PaymentPattern {
  person: string;
  categoryBreakdown: { [category: string]: { amount: number; count: number } };
  preferredStores: { store: string; frequency: number; totalSpent: number }[];
  averageTransactionSize: number;
  paymentFrequency: { [dayOfWeek: string]: number };
  monthlySpending: { [month: string]: number };
}

interface StoreAnalytics {
  storeName: string;
  visitFrequency: number;
  averageSpend: number;
  totalSpent: number;
  popularDays: { day: string; frequency: number }[];
  categories: string[];
  firstVisited: string;
  lastVisited: string;
  monthlyTrend: { month: string; amount: number; visits: number }[];
}

interface CategoryTrend {
  category: string;
  monthlySpend: { month: string; amount: number; count: number }[];
  growthRate: number;
  largestTransaction: Transaction;
  smallestTransaction: Transaction;
  averageTransactionSize: number;
  commonStores: { store: string; amount: number; frequency: number }[];
  dayOfWeekPattern: { [day: string]: number };
}

interface BalanceAnalytics {
  currentBalance: { [person: string]: number };
  balanceHistory: { date: string; balance: number; person: string }[];
  monthlyBalanceChange: { month: string; change: number }[];
  paymentFrequency: { [person: string]: number };
  largestImbalancePeriod: { start: string; end: string; maxImbalance: number };
}

interface SpendingHeatmap {
  date: string;
  amount: number;
  transactionCount: number;
  categories: string[];
  dayOfWeek: string;
  weekOfYear: number;
}

interface BudgetIntelligence {
  categoryRecommendations: {
    category: string;
    suggestedBudget: number;
    currentMonthlyAverage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
  }[];
  anomalies: {
    transaction: Transaction;
    anomalyType: 'unusually_high' | 'unusual_store' | 'unusual_category';
    score: number;
  }[];
  predictedNextMonthSpending: {
    category: string;
    predictedAmount: number;
    confidence: number;
  }[];
}
```

### STEP 2: CREATE ADVANCED ANALYTICS SERVICE
**File to create:** `node/backend/src/services/AdvancedAnalyticsService.ts`

**Requirements:**
- Import Transaction interface from existing types
- Import new Analytics interfaces from Step 1
- Use existing storeMappings pattern from current codebase
- Follow existing service class pattern (static methods)
- Add comprehensive error handling
- Include detailed JSDoc comments
- Use date-fns for date calculations (already in dependencies)

**Methods to implement with detailed logic:**

```typescript
class AdvancedAnalyticsService {
  /**
   * Analyzes payment patterns for each person
   * Logic: Group transactions by person (from shares), calculate category breakdowns,
   * find preferred stores, compute averages and frequencies
   */
  static getPaymentPatterns(transactions: Transaction[], storeMappings: { [canonical: string]: string[] }): PaymentPattern[]

  /**
   * Provides detailed analytics for each store
   * Logic: Use storeMappings to group store variations, calculate visit frequency,
   * spending patterns, popular visit days using date analysis
   */
  static getStoreAnalytics(transactions: Transaction[], storeMappings: { [canonical: string]: string[] }): StoreAnalytics[]

  /**
   * Analyzes trends for each spending category
   * Logic: Group by category, calculate monthly trends, growth rates,
   * find min/max transactions, analyze day-of-week patterns
   */
  static getCategoryTrends(transactions: Transaction[], storeMappings: { [canonical: string]: string[] }): CategoryTrend[]

  /**
   * Tracks balance between people over time
   * Logic: Calculate running balance from transaction shares,
   * track balance history chronologically, find imbalance periods
   */
  static getBalanceAnalytics(transactions: Transaction[]): BalanceAnalytics

  /**
   * Creates spending heatmap data for calendar visualization
   * Logic: Group transactions by date, calculate daily totals,
   * determine day of week and week of year for calendar layout
   */
  static getSpendingHeatmap(transactions: Transaction[], dateRange?: { start: string; end: string }): SpendingHeatmap[]

  /**
   * Provides budget recommendations and anomaly detection
   * Logic: Calculate category averages, detect statistical outliers,
   * predict next month spending using trend analysis
   */
  static getBudgetIntelligence(transactions: Transaction[], storeMappings: { [canonical: string]: string[] }): BudgetIntelligence
}
```

**Implementation guidelines:**
- Use `date-fns` for all date operations
- Handle edge cases (empty data, invalid dates)
- Sort results logically (by amount, frequency, date)
- Use existing utility patterns from AnalysisService.ts
- Calculate percentages and growth rates accurately
- Group store variations using storeMappings parameter

### STEP 3: CREATE NEW API ROUTES
**File to create:** `node/backend/src/routes/advancedAnalytics.ts`

**Requirements:**
- Follow existing route pattern from analysis.ts
- Use Express Router
- Include proper error handling and validation
- Check for session data existence before processing
- Return appropriate HTTP status codes
- Add query parameter parsing where needed

**Endpoints to implement:**
```typescript
// GET /api/advanced-analytics/payment-patterns
// Returns PaymentPattern[] for all people

// GET /api/advanced-analytics/payment-patterns/:person
// Returns PaymentPattern for specific person

// GET /api/advanced-analytics/stores
// Returns StoreAnalytics[] for all stores

// GET /api/advanced-analytics/categories/trends
// Returns CategoryTrend[] for all categories

// GET /api/advanced-analytics/balance
// Returns BalanceAnalytics

// GET /api/advanced-analytics/heatmap
// Query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// Returns SpendingHeatmap[]

// GET /api/advanced-analytics/budget-intelligence
// Returns BudgetIntelligence
```

**Route implementation pattern:**
```typescript
router.get('/endpoint', (req, res) => {
  try {
    // 1. Check session data exists
    if (!req.session.data?.transactions) {
      return res.status(400).json({ error: 'No transaction data found' });
    }

    // 2. Parse query parameters if needed
    
    // 3. Call AdvancedAnalyticsService method
    
    // 4. Return JSON response
    
  } catch (error) {
    console.error('Error in endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### STEP 4: UPDATE BACKEND INDEX.TS
**File to modify:** `node/backend/src/index.ts`

**Requirements:**
- Import new advancedAnalytics routes
- Add route registration following existing pattern
- Maintain existing middleware order

**Changes needed:**
```typescript
// Add import
import advancedAnalyticsRoutes from './routes/advancedAnalytics';

// Add route registration
app.use('/api/advanced-analytics', advancedAnalyticsRoutes);
```

### STEP 5: CREATE FRONTEND TYPES
**File to create:** `node/frontend/src/types/analytics.ts`

**Requirements:**
- Mirror backend Analytics.ts interfaces exactly
- Import Transaction interface from existing types
- Export all interfaces for use in components

**Code to implement:**
```typescript
// Copy all interfaces from backend Analytics.ts
// Ensure Transaction import is correct: import { Transaction } from './index';
```

### STEP 6: UPDATE FRONTEND API SERVICE
**File to modify:** `node/frontend/src/services/api.ts`

**Requirements:**
- Add new API calls for advanced analytics endpoints
- Follow existing axios pattern
- Include proper TypeScript return types
- Handle error cases consistently

**Methods to add:**
```typescript
// Add to existing api.ts file
export const getPaymentPatterns = async (): Promise<PaymentPattern[]> => {
  const response = await axios.get('/api/advanced-analytics/payment-patterns');
  return response.data;
};

export const getStoreAnalytics = async (): Promise<StoreAnalytics[]> => {
  const response = await axios.get('/api/advanced-analytics/stores');
  return response.data;
};

export const getCategoryTrends = async (): Promise<CategoryTrend[]> => {
  const response = await axios.get('/api/advanced-analytics/categories/trends');
  return response.data;
};

export const getBalanceAnalytics = async (): Promise<BalanceAnalytics> => {
  const response = await axios.get('/api/advanced-analytics/balance');
  return response.data;
};

export const getSpendingHeatmap = async (startDate?: string, endDate?: string): Promise<SpendingHeatmap[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await axios.get(`/api/advanced-analytics/heatmap?${params.toString()}`);
  return response.data;
};

export const getBudgetIntelligence = async (): Promise<BudgetIntelligence> => {
  const response = await axios.get('/api/advanced-analytics/budget-intelligence');
  return response.data;
};
```

### STEP 7: CREATE BALANCE TRACKER COMPONENT
**File to create:** `node/frontend/src/components/analytics/BalanceTracker.tsx`

**Requirements:**
- Use Material-UI components (Card, Typography, etc.)
- Use Recharts for line chart visualization
- Follow existing component patterns from dashboard folder
- Include loading and error states
- Make component responsive

**Component structure:**
```typescript
interface BalanceTrackerProps {
  // No props needed - fetches data internally
}

// Features to implement:
// 1. Running balance line chart using Recharts LineChart
// 2. Current balance summary cards
// 3. Payment frequency comparison bar chart
// 4. Monthly balance change trend
// 5. Loading skeleton while fetching data
// 6. Error handling with retry button
```

**Visual layout:**
```
┌─────────────────────────────────┐
│ Balance Tracker                 │
├─────────────────────────────────┤
│ Current Balance Summary Cards   │
│ [Person A: $XXX] [Person B: $XXX] │
├─────────────────────────────────┤
│ Running Balance Over Time       │
│ [Line Chart]                    │
├─────────────────────────────────┤
│ Monthly Balance Changes         │
│ [Bar Chart]                     │
└─────────────────────────────────┘
```

### STEP 8: CREATE SPENDING HEATMAP COMPONENT
**File to create:** `node/frontend/src/components/analytics/SpendingHeatmap.tsx`

**Requirements:**
- Create calendar-style heatmap visualization
- Use Material-UI Grid and Box components
- Implement color intensity based on spending amounts
- Add date range selector
- Include hover tooltips with transaction details

**Component structure:**
```typescript
interface SpendingHeatmapProps {
  // No props - manages date range internally
}

// Features to implement:
// 1. Calendar grid layout (7 columns for days of week)
// 2. Color intensity mapping (light to dark based on spending)
// 3. Date range picker (last 3 months, 6 months, etc.)
// 4. Hover tooltips showing daily totals and transaction count
// 5. Click to show transaction details for that day
// 6. Legend showing color scale
```

**Visual layout:**
```
┌─────────────────────────────────┐
│ Spending Calendar Heatmap       │
├─────────────────────────────────┤
│ [Date Range Selector]           │
├─────────────────────────────────┤
│ Mon Tue Wed Thu Fri Sat Sun     │
│ [█] [░] [▓] [█] [░] [▓] [█]     │
│ [░] [▓] [█] [░] [▓] [█] [░]     │
│ ...                             │
├─────────────────────────────────┤
│ [Color Legend: Light → Dark]    │
└─────────────────────────────────┘
```

### STEP 9: CREATE ANALYTICS DASHBOARD PAGE
**File to create:** `node/frontend/src/pages/AdvancedAnalyticsPage.tsx`

**Requirements:**
- Follow existing DashboardPage.tsx pattern
- Use Material-UI layout components (Container, Grid, Paper)
- Implement tabbed interface for different analytics
- Add loading states for all components
- Include error boundaries

**Page structure:**
```typescript
interface AdvancedAnalyticsPageProps {
  // No props needed
}

// Features to implement:
// 1. Tab navigation (Balance, Spending Patterns, Store Analytics, etc.)
// 2. Responsive grid layout
// 3. Loading skeleton for each section
// 4. Error handling with retry buttons
// 5. Export functionality for analytics data
```

**Tab structure:**
```
┌─────────────────────────────────┐
│ [Balance] [Spending] [Stores] [Categories] │
├─────────────────────────────────┤
│                                 │
│ [Selected Tab Content]          │
│                                 │
│                                 │
└─────────────────────────────────┘
```

### STEP 10: UPDATE NAVIGATION
**File to modify:** `node/frontend/src/components/Layout.tsx`

**Requirements:**
- Add new navigation item for Advanced Analytics
- Follow existing navigation pattern
- Update routing in App.tsx if needed

**Changes needed:**
```typescript
// Add navigation item for Advanced Analytics
// Link to /advanced-analytics route
// Use appropriate Material-UI icon (Analytics, TrendingUp, etc.)
```

### STEP 11: ADD ROUTING
**File to modify:** `node/frontend/src/App.tsx` (or main router file)

**Requirements:**
- Add route for AdvancedAnalyticsPage
- Follow existing routing pattern
- Ensure proper navigation

**Route to add:**
```typescript
<Route path="/advanced-analytics" element={<AdvancedAnalyticsPage />} />
```

## IMPLEMENTATION SUCCESS CRITERIA

### Backend Completion Checklist
- [ ] Analytics.ts types file created with all interfaces
- [ ] AdvancedAnalyticsService.ts implemented with all 6 methods
- [ ] advancedAnalytics.ts routes file with all 7 endpoints
- [ ] Backend index.ts updated with new routes
- [ ] All methods handle edge cases (empty data, invalid dates)
- [ ] All API endpoints return proper error responses
- [ ] StoreMappings integration working correctly

### Frontend Completion Checklist
- [ ] Frontend analytics types created
- [ ] API service updated with all new methods
- [ ] BalanceTracker component implemented
- [ ] SpendingHeatmap component implemented
- [ ] AdvancedAnalyticsPage created with tabs
- [ ] Navigation updated with new menu item
- [ ] Routing configured for new page
- [ ] All components handle loading and error states
- [ ] Responsive design implemented

### Testing Requirements
1. **Backend Testing:**
   - Test each AdvancedAnalyticsService method with sample data
   - Test API endpoints return correct data structure
   - Test error handling for missing session data
   - Test date range filtering for heatmap

2. **Frontend Testing:**
   - Test component rendering with mock data
   - Test loading states display correctly
   - Test error states show retry buttons
   - Test navigation to new page works

### Data Quality Requirements
1. **Balance Analytics:**
   - Running balance calculation must be accurate
   - Balance history must be chronological
   - Current balance must match latest transaction impact

2. **Store Analytics:**
   - Must use storeMappings to group variations
   - Visit frequency must count unique dates
   - Average spend calculation must be accurate

3. **Category Trends:**
   - Monthly aggregation must be accurate
   - Growth rate calculation must handle edge cases
   - Day-of-week patterns must be correctly calculated

### Performance Requirements
- All API endpoints must respond within 2 seconds
- Frontend components must render within 1 second
- Heatmap must handle 12+ months of data efficiently
- Charts must be responsive and interactive

### Error Handling Requirements
- All components must show meaningful error messages
- All API calls must have proper error boundaries
- Network failures must show retry options
- Invalid data must not crash the application

## LLM IMPLEMENTATION NOTES

### Code Style Guidelines
- Use TypeScript strict mode
- Follow existing code formatting in the project
- Use async/await instead of Promises.then()
- Include comprehensive JSDoc comments
- Use descriptive variable names
- Handle all TypeScript warnings

### Dependencies to Use
**Backend:**
- `date-fns` for all date operations
- Existing `Transaction` interface
- Express Router pattern
- Session data structure

**Frontend:**
- Material-UI components (Card, Typography, Grid, Box, etc.)
- Recharts for all charts (LineChart, BarChart, PieChart)
- React hooks (useState, useEffect)
- Axios for API calls

### Common Patterns to Follow
1. **Error Handling Pattern:**
```typescript
try {
  // Main logic
} catch (error) {
  console.error('Specific error context:', error);
  res.status(500).json({ error: 'Descriptive error message' });
}
```

2. **React Component Pattern:**
```typescript
const ComponentName: React.FC = () => {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data logic
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} onRetry={() => {}} />;
  
  return <MainContent data={data} />;
};
```

3. **API Service Pattern:**
```typescript
export const getDataName = async (): Promise<DataType[]> => {
  const response = await axios.get('/api/endpoint');
  return response.data;
};
```

### Specific Calculation Requirements

**Balance Calculation Logic:**
```typescript
// For each transaction, person's balance change = their share amount
// Running balance = cumulative sum of balance changes over time
// Positive balance means person is owed money
// Negative balance means person owes money
```

**Store Grouping Logic:**
```typescript
// Use storeMappings to find canonical name for each store
// If store not in mappings, use original description
// Group all analytics by canonical store names
```

**Growth Rate Calculation:**
```typescript
// Monthly growth rate = (current month - previous month) / previous month * 100
// Handle zero/negative values appropriately
// Use 3-month moving average for trend detection
```

This implementation plan is now ready for an LLM to generate complete, functional code following the existing project patterns and requirements.
