import { Box, Typography, Paper } from '@mui/material';

export default function AuthForm({ title, children }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {title}
        </Typography>
        {children}
      </Paper>
    </Box>
  );
}