import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './styles/theme';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import Keys from './pages/Keys';
import AdminPendingUsers from './pages/AdminPendingUsers';
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/files" element={<Files />} />
          <Route path="/keys" element={<Keys />} />
          <Route path="/admin/pending-users" element={<AdminPendingUsers />} />

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}