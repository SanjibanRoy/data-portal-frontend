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
import { mockApiKeys } from '../services/mockData';

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

  const fetchKeys = () => {
    setLoading(true);
    // Simulate API fetch
    setTimeout(() => {
      setKeys(mockApiKeys);
      setLoading(false);
    }, 800);
  };

  const filteredKeys = keys.filter(key =>
    key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateNewKey = () => {
    // Simulate API call
    setTimeout(() => {
      const mockKey = `sk_live_${Math.random().toString(36).substring(2, 18)}_${Math.random().toString(36).substring(2, 10)}`;
      setGeneratedKey(mockKey);
      setSnackbar({
        open: true,
        message: 'New API key generated',
        severity: 'success'
      });
    }, 1000);
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

  const handleDeleteKey = (id) => {
    // Simulate API call
    setTimeout(() => {
      setKeys(keys.filter(key => key.id !== id));
      setDeleteConfirm(null);
      setSnackbar({
        open: true,
        message: 'API key deleted',
        severity: 'success'
      });
    }, 800);
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
                    <TableCell sx={{ fontWeight: 600 }}>Key</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Last Used</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredKeys.length > 0 ? (
                    filteredKeys.map((key) => (
                      <TableRow key={key.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{key.name}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {key.key.substring(0, 8)}...
                            <IconButton 
                              size="small" 
                              onClick={() => copyToClipboard(key.key)}
                              sx={{ ml: 1 }}
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={key.active ? 'Active' : 'Inactive'} 
                            color={key.active ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{formatDate(key.created)}</TableCell>
                        <TableCell>{formatDate(key.lastUsed)}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => copyToClipboard(key.key)}
                            sx={{ 
                              '&:hover': { backgroundColor: 'primary.light', color: 'primary.main' }
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => setDeleteConfirm(key.id)}
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
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
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