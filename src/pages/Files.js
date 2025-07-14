import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  CircularProgress,
  Button,
  Checkbox,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  Paper,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SearchIcon from '@mui/icons-material/Search';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function Files() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [shareLink, setShareLink] = useState('');

  // Utility functions
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async (path = '') => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.0.236:9900/files/files' + (path ? `?path=${encodeURIComponent(path)}` : ''), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setFiles(data.files);
      setCurrentPath(data.path);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch files',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId) 
        : [...prev, fileId]
    );
  };

  const handleFolderClick = (folderPath) => {
    fetchFiles(folderPath);
  };

  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = `http://192.168.0.236:9900/files/download?path=${encodeURIComponent(file.path)}`;
    link.setAttribute('download', file.name);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSelected = async () => {
    if (selectedFiles.length === 0) return;

    try {
      if (selectedFiles.length === 1) {
        const file = files.find(f => f.path === selectedFiles[0]);
        downloadFile(file);
        return;
      }

      const zip = new JSZip();
      const folder = zip.folder('downloads');
      let hasFiles = false;

      await Promise.all(selectedFiles.map(async (filePath) => {
        const file = files.find(f => f.path === filePath);
        if (file.is_file) {
          hasFiles = true;
          const response = await fetch(`http://192.168.0.236:9900/files/download?path=${encodeURIComponent(file.path)}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const blob = await response.blob();
          folder.file(file.name, blob);
        }
      }));

      if (!hasFiles) {
        setSnackbar({
          open: true,
          message: 'No files selected to download',
          severity: 'warning'
        });
        return;
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'downloads.zip');
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Download failed',
        severity: 'error'
      });
    }
  };

  const generateShareLink = async (path) => {
    try {
      const response = await fetch('http://192.168.0.236:9900/files/share', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path })
      });
      const data = await response.json();
      setShareLink(`${window.location.origin}/download?token=${data.token}`);
      setSnackbar({
        open: true,
        message: 'Share link generated',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to generate share link',
        severity: 'error'
      });
    }
  };

  const navigateUp = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    if (parentPath) {
      fetchFiles(parentPath);
    } else {
      fetchFiles();
    }
  };

  const renderBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    
    return (
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link 
          color="inherit" 
          onClick={() => fetchFiles()}
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          Home
        </Link>
        {parts.map((part, index) => {
          const path = parts.slice(0, index + 1).join('/');
          return (
            <Link
              key={path}
              color="inherit"
              onClick={() => fetchFiles(path)}
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              {part}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };

  return (
    <Box display="flex" sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, backgroundColor: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              File Manager
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search files..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                  sx: { borderRadius: 2 }
                }}
                sx={{ width: 300 }}
              />
              
              {selectedFiles.length > 0 && (
                <Button 
                  variant="contained" 
                  startIcon={<DownloadIcon />}
                  onClick={downloadSelected}
                  sx={{ borderRadius: 2 }}
                >
                  Download ({selectedFiles.length})
                </Button>
              )}
            </Box>
          </Box>

          {renderBreadcrumbs()}

          <Divider sx={{ my: 2 }} />

          {loading ? (
            <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List sx={{ width: '100%' }}>
              {currentPath && (
                <ListItem 
                  button 
                  onClick={navigateUp}
                  sx={{ 
                    borderRadius: 1,
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>
                    <ArrowUpwardIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Go up one level" />
                </ListItem>
              )}
              
              {filteredFiles.map(file => (
                <ListItem
                  key={file.path}
                  sx={{
                    borderRadius: 1,
                    '&:hover': { backgroundColor: 'action.hover' },
                    mb: 0.5
                  }}
                >
                  <Checkbox 
                    checked={selectedFiles.includes(file.path)}
                    onChange={() => handleFileSelect(file.path)}
                    sx={{ mr: 1 }}
                  />
                  
                  <ListItemIcon>
                    {file.is_file ? (
                      <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                        <FileCopyIcon fontSize="small" sx={{ color: 'primary.main' }} />
                      </Avatar>
                    ) : (
                      <Avatar sx={{ bgcolor: 'secondary.light', width: 32, height: 32 }}>
                        <FolderIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                      </Avatar>
                    )}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Typography 
                        onClick={() => file.is_file ? null : handleFolderClick(file.path)}
                        sx={{ 
                          cursor: file.is_file ? 'default' : 'pointer',
                          fontWeight: file.is_file ? 500 : 600
                        }}
                      >
                        {file.name}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {file.is_file ? formatBytes(file.size) : 'Folder'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Modified: {formatDate(file.modified)}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title={file.is_file ? "Download" : "Download as ZIP"}>
                        <IconButton 
                          onClick={() => downloadFile(file)}
                          size="small"
                          sx={{ 
                            backgroundColor: 'action.selected',
                            '&:hover': { backgroundColor: 'action.hover' }
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {!file.is_file && (
                        <Tooltip title="Generate share link">
                          <IconButton 
                            onClick={() => generateShareLink(file.path)}
                            size="small"
                            sx={{ 
                              backgroundColor: 'action.selected',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                          >
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              
              {filteredFiles.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    {searchTerm ? 'No files match your search' : 'This folder is empty'}
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </Paper>

        {shareLink && (
          <Paper elevation={0} sx={{ mt: 3, p: 3, borderRadius: 3, backgroundColor: 'white' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Shareable Link
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              backgroundColor: 'grey.100',
              p: 2,
              borderRadius: 1
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  flexGrow: 1, 
                  wordBreak: 'break-all',
                  fontFamily: 'monospace'
                }}
              >
                {shareLink}
              </Typography>
              <Button 
                startIcon={<FileCopyIcon />}
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  setSnackbar({
                    open: true,
                    message: 'Link copied to clipboard',
                    severity: 'success'
                  });
                }}
                variant="outlined"
                size="small"
              >
                Copy
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              This link will expire in 7 days
            </Typography>
          </Paper>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
            elevation={6}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}