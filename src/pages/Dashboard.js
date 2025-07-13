import { Box, Typography, Paper } from '@mui/material';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  return (
    <Box display="flex">
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Data Portal
          </Typography>
          <Typography>
            Manage your data files and API keys from this dashboard.
          </Typography>
        </Paper>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Quick Stats
          </Typography>
          <Typography>
            Total Files: 0 | API Keys: 0 | Storage Used: 0 MB
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}