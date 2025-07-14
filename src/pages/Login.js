// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TextField,
  Button,
  Link,
  CircularProgress,
  Alert,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Fade,
  Paper,
  Divider,
  styled
} from '@mui/material';
import {
  EmailOutlined,
  LockOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// Styled components
const GlassPaper = styled(Paper)(({ theme }) => ({
  backdropFilter: 'blur(16px)',
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  borderRadius: '16px',
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: 450,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #3f51b5 0%, #2196F3 100%)',
  color: 'white',
  fontWeight: 600,
  letterSpacing: '0.5px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(33, 150, 243, 0.3)',
  },
}));

function PasswordStrengthMeter({ password }) {
  if (!password) return null;

  const strength = Math.min(
    Math.floor(password.length / 3) +
    (/\d/.test(password) ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0),
    5
  );

  return (
    <Box sx={{ mt: 1, mb: 2 }}>
      <Typography variant="caption" color="text.secondary">
        Password strength: {strength} / 5
      </Typography>
      <Box
        sx={{
          height: 4,
          bgcolor: 'divider',
          borderRadius: 2,
          mt: 0.5,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${strength * 20}%`,
            height: '100%',
            bgcolor:
              strength < 3
                ? 'error.main'
                : strength < 5
                ? 'warning.main'
                : 'success.main',
            transition: 'width 0.3s ease-in-out',
          }}
        />
      </Box>
    </Box>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryAfter, setRetryAfter] = useState(null);
  
  const navigate = useNavigate();
  const { login, isAdmin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setRetryAfter(null);

    try {
      const success = await login(email, password);
      if (success) {
        navigate(isAdmin ? '/admin/pending-users' : '/');
      }
    } catch (err) {
      setLoading(false);
      if (err.response) {
        if (err.response.status === 429) {
          const retry = err.response.data?.retry_after || 60;
          setRetryAfter(retry);
          setError(`Too many attempts. Please try again in ${retry} seconds.`);
        } else {
          setError(err.response.data?.error || 'Authentication failed. Please try again.');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e9f2 100%)',
        p: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 10% 20%, rgba(63, 81, 181, 0.05) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(33, 150, 243, 0.05) 0%, transparent 20%)',
          zIndex: 0,
        },
      }}
    >
      <GlassPaper elevation={0} component="main" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, color: 'text.primary', mb: 1, letterSpacing: '-0.5px' }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to continue to your account
          </Typography>
        </Box>

        <Fade in={!!error} timeout={300} unmountOnExit>
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: '8px', alignItems: 'center' }}
            onClose={() => {
              setError('');
              setRetryAfter(null);
            }}
          >
            {error}
          </Alert>
        </Fade>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email or Username"
            variant="outlined"
            fullWidth
            margin="normal"
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined color="action" sx={{ opacity: 0.7 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(0, 0, 0, 0.2)' },
              },
            }}
          />

          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined color="action" sx={{ opacity: 0.7 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(0, 0, 0, 0.2)' },
              },
            }}
          />

          <PasswordStrengthMeter password={password} />

          <Box sx={{ mb: 2, textAlign: 'right' }}>
            <Link href="/forgot-password" underline="hover" variant="body2" color="primary">
              Forgot Password?
            </Link>
          </Box>

          <GradientButton
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            size="large"
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </GradientButton>
        </form>

        <Divider sx={{ my: 3 }}>OR</Divider>

        <Typography variant="body2" align="center" color="text.secondary">
          Don't have an account?{' '}
          <Link href="/register" underline="hover" color="primary" sx={{ fontWeight: 'bold' }}>
            Sign Up
          </Link>
        </Typography>
      </GlassPaper>
    </Box>
  );
}