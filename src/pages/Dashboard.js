import { Box, Typography, Paper, Grid, Stack, LinearProgress, styled,Button } from '@mui/material';
import { 
  InsertDriveFile as FilesIcon,
  VpnKey as KeysIcon,
  Storage as StorageIcon,
  CloudUpload as UploadIcon,
  Notifications as ActivityIcon
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';

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

export default function Dashboard() {
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
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Welcome back to Data Portal
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Manage your data files and API keys from this dashboard.
          </Typography>
        </Paper>

        {/* Stats Overview */}
        <Grid container spacing={3} mb={4}>
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
              <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
                0
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={0} 
                sx={{ 
                  height: 6,
                  borderRadius: 3,
                  mb: 1,
                  backgroundColor: '#E5E7EB',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#3B82F6'
                  }
                }} 
              />
              <Typography variant="caption" color="text.secondary">
                No files uploaded yet
              </Typography>
            </StatCard>
          </Grid>

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
              <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
                0
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={0} 
                sx={{ 
                  height: 6,
                  borderRadius: 3,
                  mb: 1,
                  backgroundColor: '#E5E7EB',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#10B981'
                  }
                }} 
              />
              <Typography variant="caption" color="text.secondary">
                No active keys
              </Typography>
            </StatCard>
          </Grid>

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
              <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
                0 MB
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={0} 
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
                0% of 1GB used
              </Typography>
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
                Recent Activity
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '120px',
                color: 'text.secondary'
              }}>
                <ActivityIcon sx={{ fontSize: '48px', opacity: 0.3, mr: 2 }} />
                <Typography>No recent activity</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}