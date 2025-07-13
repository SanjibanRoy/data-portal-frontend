import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';

export default function Header() {
  const isAuthenticated = localStorage.getItem('mockAuth');

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Data Portal
        </Typography>
        {isAuthenticated ? (
          <Button color="inherit" startIcon={<AccountCircle />}>
            My Account
          </Button>
        ) : (
          <>
            <Button color="inherit" href="/login">
              Login
            </Button>
            <Button color="inherit" href="/register">
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}