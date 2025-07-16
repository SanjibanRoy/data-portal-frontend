import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Link,
  Alert,
  Typography,
  Box,
  CircularProgress,
  InputAdornment,
  Divider,
  Paper,
  styled,
  IconButton,
  Fade
} from '@mui/material';
import {
  PersonOutline,
  EmailOutlined,
  LockOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined
} from '@mui/icons-material';
import axios from 'axios';

// Security configurations
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://14.139.63.156:9900/apiis';
const PASSWORD_MIN_LENGTH = 12;

const GlassCard = styled(Paper)(({ theme }) => ({
  backdropFilter: 'blur(16px)',
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  borderRadius: '16px',
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: '450px',
  margin: 'auto'
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #3f51b5 0%, #2196F3 100%)',
  color: 'white',
  fontWeight: 600,
  letterSpacing: '0.5px',
  padding: theme.spacing(1.5),
  borderRadius: '12px',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(33, 150, 243, 0.3)'
  }
}));

const PasswordStrengthIndicator = ({ password }) => {
  const calculateStrength = () => {
    let strength = 0;
    if (password.length >= PASSWORD_MIN_LENGTH) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 5);
  };

  const strength = calculateStrength();
  const colors = ['error.main', 'error.main', 'warning.main', 'success.main', 'success.main'];
  const labels = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'];
  
  return (
    <Box sx={{ width: '100%', mt: 0.5 }}>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              height: 4,
              flex: 1,
              backgroundColor: i < strength ? colors[strength - 1] : 'divider',
              borderRadius: 2,
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </Box>
      <Typography variant="caption" color={colors[strength - 1] || 'text.secondary'}>
        {password ? labels[strength - 1] || '' : ''}
      </Typography>
    </Box>
  );
};

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameValid, setUsernameValid] = useState(true);
  const [emailValid, setEmailValid] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Validate fields as user types
    if (name === 'username') {
      setUsernameValid(value.length >= 4 && /^[a-zA-Z0-9_]+$/.test(value));
    }
    if (name === 'email') {
      setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
    }
  };

  const togglePasswordVisibility = (field) => {
    setForm({ ...form, [field]: !form[field] });
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword } = form;

    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (!usernameValid) {
      setError('Username must be at least 4 characters and contain only letters, numbers, and underscores');
      return false;
    }

    if (!emailValid) {
      setError('Please enter a valid email address');
      return false;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
      return false;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setError('Password must contain uppercase, lowercase, number, and special character');
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const response = await axios.post(`${API_BASE_URL}/users/register`, {
        username: form.username,
        email: form.email.toLowerCase(),
        password: form.password
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.message?.includes('pending admin approval')) {
        setSuccess('Registration successful! Please wait for admin approval. You will be redirected to login shortly.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          setError(err.response.data.error || 'Registration failed. Please check your details.');
        } else if (err.response.status === 429) {
          setError('Too many registration attempts. Please try again later.');
        } else {
          setError('Registration failed. Please try again.');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
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
        background: 'radial-gradient(circle at 10% 20%, rgba(63, 81, 181, 0.05) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(33, 150, 243, 0.05) 0%, transparent 20%)',
        zIndex: 0
      }
    }}>
      <GlassCard elevation={0}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700,
            color: 'text.primary',
            mb: 1,
            letterSpacing: '-0.5px'
          }}>
            Create Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join us to get started
          </Typography>
        </Box>

        <Fade in={!!error}>
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: '8px' }} 
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        </Fade>

        <Fade in={!!success}>
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: '8px' }} 
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        </Fade>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            name="username"
            fullWidth
            margin="normal"
            value={form.username}
            onChange={handleChange}
            error={!usernameValid && form.username.length > 0}
            helperText={!usernameValid && form.username.length > 0 ? 
              '4+ chars, letters, numbers, underscores only' : ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutline color="action" sx={{ opacity: 0.7 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.1)'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.2)'
                }
              }
            }}
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
            error={!emailValid && form.email.length > 0}
            helperText={!emailValid && form.email.length > 0 ? 
              'Please enter a valid email address' : ''}
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
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.1)'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.2)'
                }
              }
            }}
            required
          />

          <TextField
            label="Password"
            name="password"
            type={form.showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={form.password}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined color="action" sx={{ opacity: 0.7 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => togglePasswordVisibility('showPassword')}
                    edge="end"
                    size="small"
                    sx={{ color: 'text.secondary' }}
                  >
                    {form.showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              mb: 0,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.1)'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.2)'
                }
              }
            }}
            required
          />
          <PasswordStrengthIndicator password={form.password} />

          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, mb: 2 }}>
            Password must be at least {PASSWORD_MIN_LENGTH} characters with uppercase, lowercase, number, and special character
          </Typography>

          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type={form.showConfirmPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={form.confirmPassword}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined color="action" sx={{ opacity: 0.7 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => togglePasswordVisibility('showConfirmPassword')}
                    edge="end"
                    size="small"
                    sx={{ color: 'text.secondary' }}
                  >
                    {form.showConfirmPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.1)'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.2)'
                }
              }
            }}
            required
          />

          <GradientButton
            type="submit"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </GradientButton>

          <Divider sx={{ my: 3, color: 'text.secondary' }}>or</Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link 
                href="/login" 
                color="primary"
                fontWeight="600"
                underline="hover"
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </form>
      </GlassCard>
    </Box>
  );
}