import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  Divider, 
  Typography 
} from '@mui/material';
import { 
  Dashboard, 
  Folder, 
  VpnKey, 
  Settings, 
  ExitToApp 
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;

export default function Sidebar() {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  // Shared styles for nav items
  const menuItemStyles = {
    color: 'white',
    '& .MuiListItemText-primary': {
      color: 'white',
      fontWeight: 500,
    },
    '& .MuiListItemIcon-root': {
      color: 'white',
    },
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: '8px',
      mx: 1,
      '& .MuiListItemIcon-root': {
        color: '#FFEB3B',
      },
      '& .MuiListItemText-primary': {
        color: '#FFEB3B',
      },
    },
    '&.Mui-selected': {
      backgroundColor: 'rgba(255, 255, 255, 0.2) !important',
      borderRadius: '8px',
      mx: 1,
      '& .MuiListItemIcon-root': {
        color: '#FFEB3B',
      },
      '& .MuiListItemText-primary': {
        color: '#FFEB3B',
      },
    },
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { 
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
          color: 'white',
          borderRight: 'none',
        },
      }}
    >
      {/* Sidebar Logo */}
      <Box 
        sx={{ 
          p: 2, 
          textAlign: 'center',
          transition: 'color 0.3s ease',
          color: 'white',
          '&:hover': {
            color: '#FFEB3B',
          }
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'inherit' }}>
          NCMRWF
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 1)' }} />

      <List sx={{ mt: 2 }}>
        <ListItem 
          button 
          component={Link} 
          to="/"
          sx={menuItemStyles}
        >
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        <ListItem 
          button 
          component={Link} 
          to="/files"
          sx={menuItemStyles}
        >
          <ListItemIcon>
            <Folder />
          </ListItemIcon>
          <ListItemText primary="Files" />
        </ListItem>

        <ListItem 
          button 
          component={Link} 
          to="/keys"
          sx={menuItemStyles}
        >
          <ListItemIcon>
            <VpnKey />
          </ListItemIcon>
          <ListItemText primary="API Keys" />
        </ListItem>
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

        <ListItem 
          button 
          component={Link} 
          to="/settings"
          sx={{
            ...menuItemStyles,
            '&:hover': {
              backgroundColor: '#fdededff',
              borderRadius: '8px',
              mx: 1,
              '& .MuiListItemIcon-root': {
                color: '#FF5722',
              },
              '& .MuiListItemText-primary': {
                color: '#FF5722',
              },
            }
          }}
        >
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>

        <ListItem 
          button 
          onClick={handleLogout}
          sx={{
            color: 'white',
            '& .MuiListItemText-primary': {
              color: 'white',
              fontWeight: 500,
            },
            '& .MuiListItemIcon-root': {
              color: 'white',
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 99, 71, 0.2)',
              borderRadius: '8px',
              mx: 1,
              '& .MuiListItemIcon-root': {
                color: '#FF6347',
              },
              '& .MuiListItemText-primary': {
                color: '#FF6347',
              },
            },
          }}
        >
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </Box>
    </Drawer>
  );
}
