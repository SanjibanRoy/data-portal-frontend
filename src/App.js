// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './styles/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import Keys from './pages/Keys';
import AdminPendingUsers from './pages/AdminPendingUsers';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

const AppContent = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/files" element={<ProtectedRoute><Files /></ProtectedRoute>} />
        <Route path="/keys" element={<ProtectedRoute><Keys /></ProtectedRoute>} />
        <Route path="/admin/pending-users" element={<ProtectedRoute adminOnly><AdminPendingUsers /></ProtectedRoute>} />
      </Routes>
    </>
  );
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { authToken, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default App;