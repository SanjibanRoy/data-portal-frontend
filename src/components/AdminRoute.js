// src/components/AdminRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAdmin ? children : <Navigate to="/" replace />;
}