import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
  Grid,
  TextField,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import axios from 'axios';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
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

export default function SettingsPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
        
        // Check if coming from security redirect
        if (location.pathname.includes('security')) {
          setTabValue(1);
        }
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
  }, [navigate, location]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('authToken');
      await axios.put('http://192.168.0.236:9900/user/profile', userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Account Settings
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Paper elevation={3}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Profile" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Security" icon={<LockIcon />} iconPosition="start" />
          <Tab label="Notifications" icon={<NotificationsIcon />} iconPosition="start" />
          {isAdmin && <Tab label="Admin" icon={<AdminIcon />} iconPosition="start" />}
        </Tabs>
        <Divider />

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
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
                <Button variant="outlined" sx={{ mb: 3 }}>
                  Upload New Photo
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={userData?.username || ''}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={userData?.email || ''}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={userData?.bio || ''}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                margin="normal"
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                margin="normal"
              />
              <Button 
                variant="contained" 
                startIcon={<LockIcon />}
                sx={{ mt: 2 }}
              >
                Update Password
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Two-Factor Authentication
              </Typography>
              <FormControlLabel
                control={
                  <Switch 
                    checked={userData?.two_factor_enabled || false}
                    onChange={handleToggleChange}
                    name="two_factor_enabled"
                  />
                }
                label="Enable Two-Factor Authentication"
              />
              {userData?.two_factor_enabled && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Scan this QR code with your authenticator app:
                  </Typography>
                  {/* Placeholder for QR code */}
                  <Box sx={{ 
                    width: 200, 
                    height: 200, 
                    bgcolor: 'grey.200', 
                    mt: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="caption">QR Code</Typography>
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>
          <FormControlLabel
            control={
              <Switch 
                checked={userData?.email_notifications || false}
                onChange={handleToggleChange}
                name="email_notifications"
              />
            }
            label="Email Notifications"
          />
          <FormControlLabel
            control={
              <Switch 
                checked={userData?.push_notifications || false}
                onChange={handleToggleChange}
                name="push_notifications"
              />
            }
            label="Push Notifications"
            sx={{ display: 'block', mt: 1 }}
          />
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            Notification Types
          </Typography>
          <FormControlLabel
            control={
              <Switch 
                checked={userData?.notify_new_messages || false}
                onChange={handleToggleChange}
                name="notify_new_messages"
              />
            }
            label="New Messages"
          />
          <FormControlLabel
            control={
              <Switch 
                checked={userData?.notify_system_updates || false}
                onChange={handleToggleChange}
                name="notify_system_updates"
              />
            }
            label="System Updates"
            sx={{ display: 'block', mt: 1 }}
          />
        </TabPanel>

        {isAdmin && (
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Administrator Settings
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Default User Role</InputLabel>
              <Select
                value={userData?.default_user_role || 'user'}
                label="Default User Role"
                name="default_user_role"
                onChange={handleInputChange}
              >
                <MenuItem value="user">Regular User</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch 
                  checked={userData?.require_approval || false}
                  onChange={handleToggleChange}
                  name="require_approval"
                />
              }
              label="Require New User Approval"
            />
            <TextField
              fullWidth
              label="Admin Notes"
              name="admin_notes"
              value={userData?.admin_notes || ''}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={4}
            />
          </TabPanel>
        )}

        <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}