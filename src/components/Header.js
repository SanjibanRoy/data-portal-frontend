import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem,
  Box,
  Badge,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  AccountCircle,
  Menu as MenuIcon,
  Login as LoginIcon,
  HowToReg,
  Notifications
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { authToken, isAdmin, logout } = useAuth();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  return (
    <AppBar position="sticky" sx={{ 
      background: 'linear-gradient(135deg, #6e8efb 0%, #4a6cf7 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      color: 'white'
    }}>
      <Toolbar sx={{ 
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        py: 1
      }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            cursor: 'pointer',
            '&:hover': { opacity: 0.9 }
          }}
          onClick={() => navigate('/')}
        >
          DataPortal
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={handleMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  minWidth: 200,
                  borderRadius: 2,
                  mt: 1.5,
                }
              }}
            >
              {authToken ? (
                [
                  <MenuItem key="profile" onClick={() => navigate('/profile')}>
                    <AccountCircle sx={{ mr: 1, color: '#4a6cf7' }} /> Profile
                  </MenuItem>,
                  isAdmin && (
                    <MenuItem key="admin" onClick={() => navigate('/admin')}>
                      <AccountCircle sx={{ mr: 1, color: '#4a6cf7' }} /> Admin
                    </MenuItem>
                  ),
                  <MenuItem key="notifications" onClick={() => navigate('/notifications')}>
                    <Badge badgeContent={3} color="error" sx={{ mr: 1 }}>
                      <Notifications sx={{ color: '#4a6cf7' }} />
                    </Badge>
                    Notifications
                  </MenuItem>,
                  <MenuItem key="logout" onClick={handleLogout} sx={{ color: '#ff5252' }}>
                    Logout
                  </MenuItem>
                ].filter(Boolean)
              ) : (
                [
                  <MenuItem key="login" onClick={() => navigate('/login')}>
                    <LoginIcon sx={{ mr: 1, color: '#4a6cf7' }} /> Login
                  </MenuItem>,
                  <MenuItem key="register" onClick={() => navigate('/register')}>
                    <HowToReg sx={{ mr: 1, color: '#4a6cf7' }} /> Register
                  </MenuItem>
                ]
              )}
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {authToken ? (
              <>
                {/* <IconButton color="inherit" onClick={() => navigate('/notifications')}>
                  <Badge badgeContent={3} color="error">
                    <Notifications />
                  </Badge>
                </IconButton> */}
                {isAdmin && (
                  <Button
                    color="inherit"
                    onClick={() => navigate('/admin/pending-users')}
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Admin Panel
                  </Button>
                )}
                <Button
                  color="inherit"
                  startIcon={<AccountCircle />}
                  onClick={() => navigate('/profile')}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  My Account
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleLogout}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderColor: 'white'
                    }
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<HowToReg />}
                  onClick={() => navigate('/register')}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                    backgroundColor: 'white',
                    color: '#4a6cf7',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}