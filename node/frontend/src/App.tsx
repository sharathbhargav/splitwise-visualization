import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { UploadPage } from './pages/UploadPage';
import { RefineDataPage } from './pages/RefineDataPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdvancedAnalyticsPage } from './pages/AdvancedAnalyticsPage';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<UploadPage />} />
            <Route path="refine-data" element={<RefineDataPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="advanced-analytics" element={<AdvancedAnalyticsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;