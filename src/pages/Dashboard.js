import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Stack, LinearProgress, styled, Button,
  CircularProgress, Alert
} from '@mui/material';
import { 
  InsertDriveFile as FilesIcon,
  VpnKey as KeysIcon,
  Storage as StorageIcon,
  CloudUpload as UploadIcon,
  Notifications as ActivityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6]
  }
}));


const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://14.139.63.156:9900/apiis',
});

api.interceptors.request.use(config => {
  let token = localStorage.getItem('authToken');

  if (token?.startsWith("b'") && token.endsWith("'")) {
    token = token.slice(2, -1); // Remove b' prefix and ' suffix
  }

  if (token) {
    console.log('Cleaned Auth Token:', token);
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default function Dashboard() {
  const [stats, setStats] = useState({
    files: null,
    apiKeys: null,
    storage: null
  });
  const [loading, setLoading] = useState({
    files: false,
    apiKeys: false,
    storage: false
  });
  const [error, setError] = useState(null);
  const [uploadAlert, setUploadAlert] = useState(false);

  const fetchFilesData = async () => {
    try {
      setLoading(prev => ({ ...prev, files: true }));
      const response = await api.get('/api/files');
      setStats(prev => ({
        ...prev,
        files: response.data.data
      }));
    } catch (err) {
      setError('Failed to fetch files data');
      console.error('Files data error:', err);
    } finally {
      setLoading(prev => ({ ...prev, files: false }));
    }
  };

  const fetchApiKeysData = async () => {
    try {
      setLoading(prev => ({ ...prev, apiKeys: true }));
      const response = await api.get('/api/keys');
      setStats(prev => ({
        ...prev,
        apiKeys: response.data.data
      }));
    } catch (err) {
      setError('Failed to fetch API keys data');
      console.error('API keys error:', err);
    } finally {
      setLoading(prev => ({ ...prev, apiKeys: false }));
    }
  };

  const fetchStorageData = async () => {
    try {
      setLoading(prev => ({ ...prev, storage: true }));
      const response = await api.get('/api/storage');
      setStats(prev => ({
        ...prev,
        storage: response.data.data
      }));
    } catch (err) {
      setError('Failed to fetch storage data');
      console.error('Storage error:', err);
    } finally {
      setLoading(prev => ({ ...prev, storage: false }));
    }
  };

  const fetchAllData = () => {
    setError(null);
    fetchFilesData();
    fetchApiKeysData();
    fetchStorageData();
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculatePercentage = (used, limit) => {
    return limit > 0 ? Math.round((used / limit) * 100) : 0;
  };

  const handleUploadClick = () => {
    setUploadAlert(true);
    setTimeout(() => setUploadAlert(false), 5000);
  };

  return (
    <Box display="flex" minHeight="100vh" sx={{ backgroundColor: '#F8FAFC' }}>
      <Sidebar />
      
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        {/* Welcome Section */}
        <Paper sx={{ 
          p: 4, 
          mb: 4,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)'
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Welcome back to Data Portal
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage your data files and API keys from this dashboard.
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />}
              onClick={fetchAllData}
              disabled={loading.files || loading.apiKeys || loading.storage}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              Refresh Data
            </Button>
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Upload Alert */}
        {uploadAlert && (
          <Alert severity="info" sx={{ mb: 3 }} onClose={() => setUploadAlert(false)}>
            File upload is not available for your account. Please request access from the admin.
          </Alert>
        )}

        {/* Stats Overview */}
        <Grid container spacing={3} mb={4}>
          {/* Files Card */}
          <Grid item xs={12} md={4}>
            <StatCard elevation={3}>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Box sx={{
                  backgroundColor: '#EFF6FF',
                  p: 1.5,
                  borderRadius: '10px'
                }}>
                  <FilesIcon sx={{ color: '#3B82F6', fontSize: '28px' }} />
                </Box>
                <Typography variant="h6" color="text.secondary">Files</Typography>
              </Stack>
              
              {loading.files ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
                    {stats.files?.file_count || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.files?.files?.length ? `${stats.files.files.length} recent files` : 'No files uploaded yet'}
                  </Typography>
                </>
              )}
            </StatCard>
          </Grid>

          {/* API Keys Card */}
          <Grid item xs={12} md={4}>
            <StatCard elevation={3}>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Box sx={{
                  backgroundColor: '#ECFDF5',
                  p: 1.5,
                  borderRadius: '10px'
                }}>
                  <KeysIcon sx={{ color: '#10B981', fontSize: '28px' }} />
                </Box>
                <Typography variant="h6" color="text.secondary">API Keys</Typography>
              </Stack>
              
              {loading.apiKeys ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
                    {stats.apiKeys?.active_keys || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.apiKeys?.api_keys?.length ? `${stats.apiKeys.api_keys.length} active keys` : 'No active keys'}
                  </Typography>
                </>
              )}
            </StatCard>
          </Grid>

          {/* Storage Card */}
          <Grid item xs={12} md={4}>
            <StatCard elevation={3}>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Box sx={{
                  backgroundColor: '#FEF2F2',
                  p: 1.5,
                  borderRadius: '10px'
                }}>
                  <StorageIcon sx={{ color: '#EF4444', fontSize: '28px' }} />
                </Box>
                <Typography variant="h6" color="text.secondary">Storage</Typography>
              </Stack>
              
              {loading.storage ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
                    {stats.storage ? formatFileSize(stats.storage.storage_used_bytes) : '0 MB'}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.storage ? calculatePercentage(
                      stats.storage.storage_used_bytes, 
                      stats.storage.storage_limit_bytes
                    ) : 0} 
                    sx={{ 
                      height: 6,
                      borderRadius: 3,
                      mb: 1,
                      backgroundColor: '#E5E7EB',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#EF4444'
                      }
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary">
                    {stats.storage ? 
                      `${calculatePercentage(
                        stats.storage.storage_used_bytes, 
                        stats.storage.storage_limit_bytes
                      )}% of ${formatFileSize(stats.storage.storage_limit_bytes)} used` : 
                      '0% of 0 MB used'}
                  </Typography>
                </>
              )}
            </StatCard>
          </Grid>
        </Grid>

        {/* Quick Actions & Recent Activity */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '12px', height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  fullWidth
                  onClick={handleUploadClick}
                  sx={{
                    py: 1.5,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: '#E5E7EB',
                    '&:hover': {
                      borderColor: '#D1D5DB'
                    }
                  }}
                >
                  Upload Files
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<KeysIcon />}
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: '#E5E7EB',
                    '&:hover': {
                      borderColor: '#D1D5DB'
                    }
                  }}
                >
                  Generate API Key
                </Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '12px', height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Files
              </Typography>
              {loading.files ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                stats.files?.files?.length ? (
                  <Stack spacing={2}>
                    {stats.files.files.slice(0, 3).map(file => (
                      <Paper key={file.file_id} sx={{ p: 2 }}>
                        <Typography variant="subtitle2">{file.path}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {file.size_human} • {file.uploaded_at}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '120px',
                    color: 'text.secondary'
                  }}>
                    <FilesIcon sx={{ fontSize: '48px', opacity: 0.3, mr: 2 }} />
                    <Typography>No files uploaded</Typography>
                  </Box>
                )
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}