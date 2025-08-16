import { 
  AppBar, 
  Box, 
  Container, 
  Toolbar, 
  Typography, 
  Tabs, 
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Upload as UploadIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

/**
 * Main layout component that wraps all pages
 * Provides consistent header, navigation, and container styling
 */
export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Define navigation items
  const navigationItems = [
    { label: 'Upload', path: '/', icon: <UploadIcon /> },
    { label: 'Refine Data', path: '/refine-data', icon: <SettingsIcon /> },
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Advanced Analytics', path: '/advanced-analytics', icon: <AnalyticsIcon /> }
  ];

  // Determine current tab based on pathname
  const getCurrentTab = () => {
    const currentPath = location.pathname;
    const tabIndex = navigationItems.findIndex(item => item.path === currentPath);
    return tabIndex >= 0 ? tabIndex : 0;
  };

  // Handle tab change navigation
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    const targetPath = navigationItems[newValue]?.path;
    if (targetPath) {
      navigate(targetPath);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: isMobile ? 1 : 0,
              mr: isMobile ? 0 : 4 
            }}
          >
            Spending Analyzer
          </Typography>
          
          {/* Navigation Tabs */}
          {!isMobile && (
            <Tabs
              value={getCurrentTab()}
              onChange={handleTabChange}
              sx={{
                flexGrow: 1,
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-selected': {
                    color: 'white'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white'
                }
              }}
            >
              {navigationItems.map((item, index) => (
                <Tab
                  key={index}
                  label={item.label}
                  icon={item.icon}
                  iconPosition="start"
                  sx={{ minHeight: 64 }}
                />
              ))}
            </Tabs>
          )}
        </Toolbar>

        {/* Mobile Navigation */}
        {isMobile && (
          <Box sx={{ borderTop: 1, borderColor: 'rgba(255, 255, 255, 0.12)' }}>
            <Tabs
              value={getCurrentTab()}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-selected': {
                    color: 'white'
                  },
                  minWidth: 'auto',
                  padding: '8px 12px'
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white'
                }
              }}
            >
              {navigationItems.map((item, index) => (
                <Tab
                  key={index}
                  label={item.label}
                  icon={item.icon}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Box>
        )}
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4, flex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
};
