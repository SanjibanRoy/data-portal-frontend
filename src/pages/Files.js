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
  Alert
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
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
  link.setAttribute('target', '_blank'); // optional: to open in a new tab
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

      // For multiple files, create a zip
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
    }
  };

  return (
    <Box display="flex">
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          {currentPath || 'My Files'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Search files"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {selectedFiles.length > 0 && (
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              onClick={downloadSelected}
            >
              Download ({selectedFiles.length})
            </Button>
          )}
        </Box>

        {currentPath !== '' && (
          <Button onClick={navigateUp} sx={{ mb: 2 }}>
            Go Up
          </Button>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {filteredFiles.map(file => (
              <Box 
                key={file.path} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 2, 
                  borderBottom: '1px solid #eee',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                {file.is_file ? (
                  <>
                    <Checkbox 
                      checked={selectedFiles.includes(file.path)}
                      onChange={() => handleFileSelect(file.path)}
                    />
                    <InsertDriveFileIcon sx={{ mr: 2 }} />
                  </>
                ) : (
                  <FolderIcon color="primary" sx={{ mr: 2 }} />
                )}
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography 
                    onClick={() => file.is_file ? null : handleFolderClick(file.path)}
                    sx={{ 
                      cursor: file.is_file ? 'default' : 'pointer',
                      fontWeight: file.is_file ? 'normal' : 'bold'
                    }}
                  >
                    {file.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {file.is_file ? `${(file.size / 1024).toFixed(2)} KB` : 'Folder'} • 
                    Modified: {new Date(file.modified).toLocaleString()}
                  </Typography>
                </Box>

                <Box>
                  {file.is_file ? (
                    <Tooltip title="Download">
                      <IconButton onClick={() => downloadFile(file)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <>
                      <Tooltip title="Download folder (ZIP)">
                        <IconButton onClick={() => downloadFile(file)}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Generate share link">
                        <IconButton onClick={() => generateShareLink(file.path)}>
                          <LinkIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {shareLink && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="h6">Share Link:</Typography>
            <Typography sx={{ wordBreak: 'break-all' }}>{shareLink}</Typography>
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                setSnackbar({
                  open: true,
                  message: 'Link copied to clipboard',
                  severity: 'success'
                });
              }}
              sx={{ mt: 1 }}
            >
              Copy Link
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}