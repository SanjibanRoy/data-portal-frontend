import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Tabs,
  Tab,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AdminPanelSettings as AdminIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://192.168.0.236:9900/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUserData(response.data);
        setIsAdmin(response.data.role === 'admin');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch profile data');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          User Profile
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<EditIcon />}
          onClick={() => navigate('/settings')}
        >
          Edit Profile
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={userData?.avatar}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  bgcolor: 'primary.main'
                }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {userData?.username}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {isAdmin && (
                  <Chip 
                    icon={<AdminIcon />} 
                    label="Admin" 
                    color="primary" 
                    size="small" 
                  />
                )}
                {userData?.verified ? (
                  <Chip 
                    icon={<VerifiedIcon />} 
                    label="Verified" 
                    color="success" 
                    size="small" 
                  />
                ) : (
                  <Chip 
                    icon={<WarningIcon />} 
                    label="Unverified" 
                    color="warning" 
                    size="small" 
                  />
                )}
              </Box>
              <Button 
                variant="contained" 
                startIcon={<LockIcon />}
                onClick={() => navigate('/settings/security')}
              >
                Change Password
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Overview" />
              <Tab label="Activity" />
              {isAdmin && <Tab label="Admin Tools" />}
            </Tabs>
            <Divider sx={{ mb: 2 }} />

            <TabPanel value={tabValue} index={0}>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <EmailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Email" 
                    secondary={userData?.email} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <CalendarIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Member Since" 
                    secondary={formatDate(userData?.created_at)} 
                  />
                </ListItem>
                {userData?.last_login && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <CalendarIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Last Login" 
                      secondary={formatDate(userData.last_login)} 
                    />
                  </ListItem>
                )}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                Recent Activity
              </Typography>
              {userData?.recent_activity?.length > 0 ? (
                <List>
                  {userData.recent_activity.map((activity, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={activity.action}
                        secondary={formatDate(activity.timestamp)}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2">No recent activity found</Typography>
              )}
            </TabPanel>

            {isAdmin && (
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Administrator Tools
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/admin/users')}
                  >
                    Manage Users
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/admin/pending')}
                  >
                    Pending Approvals
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/admin/reports')}
                  >
                    View Reports
                  </Button>
                </Box>
              </TabPanel>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}