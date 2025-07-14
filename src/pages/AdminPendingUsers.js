import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, CircularProgress, Box, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  Avatar, IconButton, Tooltip, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Chip
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Axios instance with token cleanup
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://192.168.0.236:9900',
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

export default function AdminPendingUsers() {
  const { authToken, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    if (!authToken) {
      navigate('/login');
      return;
    }

    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchUsers();
  }, [authToken, isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/pending');
      // Adapted here to expect response.data.data
      const usersData = response.data?.data || [];
      const sanitized = usersData.filter(u => u && u.id);
      setUsers(sanitized);
      setError('');
      setSuccess('');
    } catch (err) {
      setUsers([]);  // Clear users on error
      setError('Failed to fetch users');
      if (err.response?.status === 403) navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      const endpoint = `/admin/${actionType}/${selectedUser}`;
      const res = await api.post(endpoint);

      // Check for success, adapt based on your API's actual success response
      if (res.data && (res.data.success || res.status === 200)) {
        setSuccess(`User ${actionType}d successfully`);
        setUsers(users.filter(u => u.id !== selectedUser));
      } else {
        throw new Error('Action failed');
      }
    } catch {
      setError(`Failed to ${actionType} user`);
    } finally {
      setDialogOpen(false);
      setSelectedUser(null);
      setActionType('');
    }
  };

  const openConfirmDialog = (userId, type) => {
    setSelectedUser(userId);
    setActionType(type);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setActionType('');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Invalid date' : d.toLocaleString();
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress />
        <Typography mt={2}>Loading users...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Pending User Approvals</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchUsers}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && <Alert severity="error" icon={<ErrorIcon />} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}

      {users.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography>No pending users</Typography>
          <Button variant="outlined" onClick={fetchUsers} startIcon={<RefreshIcon />} sx={{ mt: 2 }}>
            Refresh
          </Button>
        </Paper>
      ) : (
        <>
          <Paper sx={{ mb: 2, p: 2 }}>
            <Chip label={`${users.length} pending`} color="warning" />
            <Typography variant="subtitle1" sx={{ mt: 1 }}>Users awaiting approval</Typography>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: 'grey.100' }}>
                <TableRow>
                  <TableCell><strong>User</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Registered</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => {
                  if (!user || !user.id) return null;

                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar src={user.avatar} sx={{ mr: 2 }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography>{user.username || 'Unknown'}</Typography>
                            <Typography variant="caption" color="text.secondary">ID: {user.id}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Approve">
                          <IconButton color="success" onClick={() => openConfirmDialog(user.id, 'approve')}>
                            <ApproveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton color="error" onClick={() => openConfirmDialog(user.id, 'reject')}>
                            <RejectIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>{actionType === 'approve' ? 'Approve' : 'Reject'} User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {actionType} this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            onClick={handleAction}
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
