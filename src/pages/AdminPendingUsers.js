// src/pages/AdminPendingUsers.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button,
  CircularProgress,
  Typography,
  Container,
  Alert
} from '@mui/material';
import axios from 'axios';

export default function AdminPendingUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdminAndFetch = async () => {
      try {
        // Verify admin status first
        const token = localStorage.getItem('authToken');
        alert(token)
        // if (!token) {
        //   navigate('/login');
        //   return;
        // }

        // Check admin status - you might want to implement this differently
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        // if (!isAdmin) {
        //   navigate('/');
        //   return;
        // }

        await fetchPendingUsers();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to verify admin status');
      }
    };

    const fetchPendingUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://192.168.0.236:9900/admin/pending', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Ensure the response data is in the expected format
        if (Array.isArray(response.data)) {
          setUsers(response.data.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            created_at: user.created_at
          })));
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch pending users');
        if (err.response?.status === 401) {
        //   navigate('/login');
        } else if (err.response?.status === 403) {
        //   navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAndFetch();
  }, [navigate]);

  const handleApprove = async (userId) => {
    try {
      setError('');
      setSuccess('');
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post(
        `http://192.168.0.236:9900/admin/approve/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Check for successful approval based on backend response
      if (response.data && response.data.status === 'success') {
        setSuccess(`Successfully approved user: ${response.data.data.username}`);
        // Update the list after approval
        setUsers(users.filter(user => user.id !== userId));
      } else {
        throw new Error(response.data?.error || 'Approval failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve user');
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 403) {
        navigate('/');
      }
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
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Pending User Approvals
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {users.length === 0 ? (
        <Typography>No pending users to approve</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => handleApprove(user.id)}
                    >
                      Approve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}