import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Link,
  Alert,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { username, email, password, confirmPassword } = form;

    if (!username || !email || !password || !confirmPassword) {
      return setError('All fields are required.');
    }

    if (password !== confirmPassword) {
      return setError("Passwords don't match.");
    }

    try {
      setLoading(true);
      const res = await axios.post('http://192.168.0.236:9900/users/register', {
        username,
        email,
        password
      });

      if (res.data.message?.includes('pending admin approval')) {
        alert('Registration successful! Please wait for admin approval.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 400, mx: 'auto', mt: 5, p: 3, boxShadow: 3, borderRadius: 2 }}
    >
      <Typography variant="h5" gutterBottom>
        Register
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        label="Username"
        name="username"
        fullWidth
        margin="normal"
        value={form.username}
        onChange={handleChange}
        required
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        fullWidth
        margin="normal"
        value={form.email}
        onChange={handleChange}
        required
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        fullWidth
        margin="normal"
        value={form.password}
        onChange={handleChange}
        required
      />
      <TextField
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        fullWidth
        margin="normal"
        value={form.confirmPassword}
        onChange={handleChange}
        required
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading}
        sx={{ mt: 3 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
      </Button>

      <Box textAlign="center" mt={2}>
        <Link href="/login" variant="body2">
          Already have an account? Login
        </Link>
      </Box>
    </Box>
  );
}
