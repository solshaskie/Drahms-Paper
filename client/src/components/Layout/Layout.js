import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Edit as EditIcon,
  FitnessCenter as FitnessIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    sidebarOpen,
    toggleSidebar,
    isDarkMode,
    setDarkMode,
  } = useAppStore();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigationItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Video Editor', icon: <EditIcon />, path: '/editor' },
    { text: 'Exercise Library', icon: <FitnessIcon />, path: '/exercise-library' },
    { text: 'About', icon: <InfoIcon />, path: '/about' },
  ];

  const drawer = (
    <Box sx={{ width: drawerWidth }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          Live Wallpaper Creator
        </Typography>
      </Box>
      <List sx={{ pt: 2 }}>
        {navigationItems.map((item) => (
          <ListItem
            key={item.text}
            button
            onClick={() => {
              navigate(item.path);
              if (isMobile) {
                toggleSidebar();
              }
            }}
            sx={{
              backgroundColor: location.pathname === item.path ? 'rgba(146, 95, 240, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(146, 95, 240, 0.04)',
              },
              mb: 0.5,
              mx: 1,
              borderRadius: 1,
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                '& .MuiListItemText-primary': {
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleSidebar}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
            {navigationItems.find(item => item.path === location.pathname)?.text || 'Live Wallpaper Creator'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme Toggle */}
            <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
              <IconButton
                color="inherit"
                onClick={() => setDarkMode(!isDarkMode)}
                sx={{ ml: 1 }}
              >
                {isDarkMode ? <LightIcon /> : <DarkIcon />}
              </IconButton>
            </Tooltip>

            {/* GitHub Link */}
            <Tooltip title="View on GitHub">
              <IconButton
                color="inherit"
                component="a"
                href="https://github.com/your-username/live-wallpaper-creator"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon />
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <Tooltip title="Account settings">
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
              >
                <AccountIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={toggleSidebar}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // AppBar height
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout;
