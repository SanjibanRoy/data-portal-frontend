import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Axios instance with token cleanup
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://192.168.0.236:9900/key',
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

export default function Keys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchKeys();
  }, []);

const fetchKeys = async () => {
  setLoading(true);
  try {
    const response = await api.get('/key');
    
    // Parse the stringified JSON response
    const parsedResponse = JSON.parse(response.data);
    
    // Access the nested `api_keys` array
    setKeys(parsedResponse.data.api_keys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    setSnackbar({
      open: true,
      message: error.response?.data?.error || 'Failed to fetch API keys',
      severity: 'error'
    });
  } finally {
    setLoading(false);
  }
};

  const filteredKeys = keys.filter(key =>
    key.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

const generateNewKey = async () => {
  try {
    const response = await api.post('/keys', { name: newKeyName });
    
    // Parse the stringified JSON response
    const parsedResponse = JSON.parse(response.data);
    
    // Extract the API key from the nested structure
    const newApiKey = parsedResponse.data.api_key;
    
    setGeneratedKey(newApiKey); // Store the new key
    fetchKeys(); // Refresh the list
    
    setSnackbar({
      open: true,
      message: 'New API key generated',
      severity: 'success'
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    setSnackbar({
      open: true,
      message: error.response?.data?.error || 'Failed to generate API key',
      severity: 'error'
    });
  }
};

  const handleGenerateClick = () => {
    if (newKeyName.trim()) {
      generateNewKey();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: 'Copied to clipboard',
      severity: 'info'
    });
  };

  const handleDeleteKey = async (id) => {
    try {
      await api.delete(`/keys/${id}`);
      fetchKeys(); // Refresh the list
      setDeleteConfirm(null);
      setSnackbar({
        open: true,
        message: 'API key deleted',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete API key',
        severity: 'error'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getKeyPreview = (keyId) => {
    // Since we don't store the full key in the frontend,
    // we can only show the key ID as a reference
    return `key_${keyId}`;
  };

  return (
    <Box display="flex" sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, backgroundColor: 'white' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              API Keys Management
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchKeys}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
              >
                New Key
              </Button>
            </Box>
          </Box>

          <TextField
            size="small"
            placeholder="Search keys..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
            sx={{ mb: 3, width: 300 }}
          />

          {loading ? (
            <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Key ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Expires</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Last Used</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredKeys.length > 0 ? (
                    filteredKeys.map((key) => (
                      <TableRow key={key.key_id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{key.name}</TableCell>
                        <TableCell>
                          {getKeyPreview(key.key_id)}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label="Active" 
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{formatDate(key.created_at)}</TableCell>
                        <TableCell>{formatDate(key.expiry_date)}</TableCell>
                        <TableCell>{formatDate(key.last_used)}</TableCell>
                        <TableCell>
                          {generatedKey && generatedKey.includes(key.key_id) ? (
                            <IconButton
                              onClick={() => copyToClipboard(generatedKey)}
                              sx={{ 
                                '&:hover': { backgroundColor: 'primary.light', color: 'primary.main' }
                              }}
                            >
                              <CopyIcon />
                            </IconButton>
                          ) : (
                            <IconButton disabled>
                              <VisibilityIcon />
                            </IconButton>
                          )}
                          <IconButton
                            onClick={() => setDeleteConfirm(key.key_id)}
                            sx={{ 
                              '&:hover': { backgroundColor: 'error.light', color: 'error.main' }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">
                          {searchTerm ? 'No matching keys found' : 'No API keys created yet'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* New Key Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Generate New API Key</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Key Name"
              fullWidth
              variant="outlined"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              sx={{ mb: 3 }}
            />
            {generatedKey && (
              <>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Make sure to copy your API key now. You won't be able to see it again!
                </Alert>
                <TextField
                  label="Your API Key"
                  fullWidth
                  value={generatedKey}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => copyToClipboard(generatedKey)}>
                          <CopyIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenDialog(false);
              setGeneratedKey('');
              setNewKeyName('');
            }}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleGenerateClick}
              disabled={!newKeyName.trim() || (generatedKey && !newKeyName.trim())}
            >
              {generatedKey ? 'Done' : 'Generate Key'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={Boolean(deleteConfirm)} 
          onClose={() => setDeleteConfirm(null)}
          maxWidth="xs"
        >
          <DialogTitle>Delete API Key</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this API key? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={() => handleDeleteKey(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}