// src/components/PrivateRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return token ? children : <Navigate to="/login" replace />;
}