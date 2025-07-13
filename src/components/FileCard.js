import { Card, CardContent, Typography, Button, Chip, Stack } from '@mui/material';
import { Download, Lock, Public } from '@mui/icons-material';

export default function FileCard({ file }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {file.name}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Chip label={file.size} size="small" />
          <Chip label={file.type} size="small" />
          {file.secure ? (
            <Chip icon={<Lock fontSize="small" />} label="Secure" size="small" color="warning" />
          ) : (
            <Chip icon={<Public fontSize="small" />} label="Public" size="small" color="success" />
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary" paragraph>
          {file.description}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          fullWidth
          size="small"
        >
          Download
        </Button>
      </CardContent>
    </Card>
  );
}