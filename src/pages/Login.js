import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Link, CircularProgress, Alert } from '@mui/material';
import AuthForm from '../components/AuthForm';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://192.168.0.236:9900/users/login', {
        username: email, // Using email as username in this example
        password
      });

      // Store the JWT token
      console.log(response.data);
      localStorage.setItem('authToken', response.data.access_token);
      localStorage.setItem('isAdmin', response.data.is_admin);

      // Redirect based on user role
      if (response.data.is_admin) {
        navigate('/admin/pending-users');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthForm title="Login">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          type="text"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Login'}
        </Button>
        <Link href="/register" variant="body2">
          Don't have an account? Register
        </Link>
      </form>
    </AuthForm>
  );
}