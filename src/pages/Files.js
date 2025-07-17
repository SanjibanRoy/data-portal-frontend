// Files.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
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
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardActions,
  Chip,
  Fab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
import SearchIcon from '@mui/icons-material/Search';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import ArchiveIcon from '@mui/icons-material/Archive';
import CodeIcon from '@mui/icons-material/Code';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const keyHex = '603deb1015ca71be2b73aef0857d7781f352c073b6108d72d9810a30914dff4f';
const ivHex = '000102030405060708090a0b0c0d0e0f';
const MAX_SELECTION_LIMIT = 10;
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://14.139.63.156:9900/apiis';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(config => {
  let token = localStorage.getItem('authToken');
  if (token?.startsWith("b'") && token.endsWith("'")) {
    token = token.slice(2, -1);
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function encryptText(text) {
  const key = CryptoJS.enc.Hex.parse(keyHex);
  const iv = CryptoJS.enc.Hex.parse(ivHex);

  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
}

export default function Files() {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [shareLink, setShareLink] = useState({ apiKey: '', open: false });
  const [contextMenu, setContextMenu] = useState({ open: false, file: null, anchorEl: null });
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchFiles();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: 'Link copied to clipboard',
      severity: 'success'
    });
  };

  const fetchFiles = async (path = '') => {
    try {
      const response = await api.get('/files/files' + (path ? `?path=${encryptText(path)}` : ''));
      setFiles(response.data.files);
      setCurrentPath(response.data.path);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch files', severity: 'error' });
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0 || isNaN(bytes)) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getFileIcon = (fileName, isFolder = false) => {
    if (isFolder) return <FolderIcon color="primary" />;
    
    const extension = fileName.split('.').pop().toLowerCase();
    switch(extension) {
      case 'pdf': return <PictureAsPdfIcon color="error" />;
      case 'jpg': case 'jpeg': case 'png': case 'gif': return <ImageIcon color="primary" />;
      case 'txt': case 'doc': case 'docx': return <DescriptionIcon color="info" />;
      case 'mp3': case 'wav': return <AudioFileIcon color="action" />;
      case 'mp4': case 'avi': return <VideoFileIcon color="secondary" />;
      case 'zip': case 'rar': return <ArchiveIcon color="warning" />;
      case 'js': case 'ts': case 'html': case 'css': return <CodeIcon color="success" />;
      default: return <InsertDriveFileIcon color="inherit" />;
    }
  };

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        if (prev.length >= MAX_SELECTION_LIMIT) {
          setSnackbar({ open: true, message: `Maximum ${MAX_SELECTION_LIMIT} files can be selected`, severity: 'warning' });
          return prev;
        }
        return [...prev, fileId];
      }
    });
  };

  const handleFolderClick = (folderPath) => {
    fetchFiles(folderPath);
  };

  const navigateUp = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    fetchFiles(parentPath || '');
  };

  const downloadItem = async (item) => {
    let token = localStorage.getItem("authToken");
    if (token?.startsWith("b'") && token.endsWith("'")) {
      token = token.slice(2, -1);
    }

    if (!token) {
      setSnackbar({ open: true, message: 'Token missing', severity: 'error' });
      return;
    }

    try {
      const res = await api.post("/files/generate-download-token", { 
        path: encryptText(item.path),
        is_folder: !item.is_file
      });
      const apiToken = res.data.token;
      const downloadUrl = `${API_BASE_URL}/files/download/${apiToken}`;

      if (item.is_file) {
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = item.name;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        window.open(downloadUrl, '_blank');
      }
    } catch (err) {
      setSnackbar({ open: true, message: `Download failed: ${err.message}`, severity: 'error' });
    }
  };

  const downloadSelectedItems = async () => {
    const itemsToDownload = files.filter(f => selectedFiles.includes(f.path) && f.is_file);
    for (const item of itemsToDownload) {
      await downloadItem(item);
    }
    setSelectedFiles([]);
  };

  const generateShareLink = async (path, isFolder = false) => {
    const token = encryptText(path);
    setShareLink({
      apiKey: `${API_BASE_URL}/apikeydownload?token=${token}&api_key=YOUR_API_KEY&is_folder=${isFolder}`,
      open: true
    });
    setSnackbar({ 
      open: true, 
      message: isFolder ? 'Folder share link generated' : 'File share link generated', 
      severity: 'success' 
    });
  };

  const renderBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Fab 
          color="primary" 
          size="small" 
          onClick={navigateUp}
          sx={{ 
            mr: 2,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'primary.dark',
              boxShadow: 'none'
            }
          }}
        >
          <ArrowUpwardIcon />
        </Fab>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" onClick={() => fetchFiles()} sx={{ cursor: 'pointer' }}>Home</Link>
          {parts.map((part, index) => {
            const path = parts.slice(0, index + 1).join('/');
            return (
              <Link key={path} color="inherit" onClick={() => fetchFiles(path)} sx={{ cursor: 'pointer' }}>
                {part}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Box>
    );
  };

  const filteredFiles = files.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const folders = filteredFiles.filter(file => !file.is_file);
  const filesList = filteredFiles.filter(file => file.is_file);

  return (
    <Box display="flex" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar />
      <Box flexGrow={1} p={4}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>My Drive</Typography>
            <Box display="flex" gap={2}>
              <TextField
                size="small"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ 
                  startAdornment: <SearchIcon color="action" />,
                  sx: { backgroundColor: 'white' }
                }}
                sx={{ width: 300 }}
              />
              <Button 
                variant={viewMode === 'grid' ? 'contained' : 'outlined'} 
                onClick={() => setViewMode('grid')}
                size="small"
              >
                Grid
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'contained' : 'outlined'} 
                onClick={() => setViewMode('list')}
                size="small"
              >
                List
              </Button>
            </Box>
          </Box>

          {renderBreadcrumbs()}
          
          {selectedFiles.length > 0 && (
            <Paper elevation={0} sx={{ 
              p: 1, 
              mb: 2,
              backgroundColor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="subtitle2" color="primary.contrastText">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
              </Typography>
              <Box>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={downloadSelectedItems}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Download
                </Button>
                <Button
                  variant="contained"
                  startIcon={<LinkIcon />}
                  onClick={() => {
                    if (selectedFiles.length === 1) {
                      const item = files.find(f => f.path === selectedFiles[0]);
                      generateShareLink(item.path, false);
                    } else {
                      setSnackbar({ 
                        open: true, 
                        message: 'Can only generate link for single file', 
                        severity: 'warning' 
                      });
                    }
                  }}
                  size="small"
                  disabled={selectedFiles.length !== 1}
                >
                  Share
                </Button>
              </Box>
            </Paper>
          )}

          <Divider sx={{ my: 2 }} />

          {viewMode === 'grid' ? (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Folders</Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {folders.map(folder => (
                  <Grid item key={folder.path} xs={12} sm={6} md={4} lg={3}>
                    <Card 
                      variant="outlined"
                      sx={{
                        '&:hover': {
                          boxShadow: 2,
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      <CardActionArea onClick={() => handleFolderClick(folder.path)}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <FolderIcon color="primary" sx={{ fontSize: 60 }} />
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              mt: 1,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {folder.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(folder.modified)}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                      <CardActions sx={{ justifyContent: 'center' }}>
                        <Tooltip title="Download">
                          <IconButton onClick={(e) => {
                            e.stopPropagation();
                            downloadItem(folder);
                          }}>
                            <DownloadIcon color="action" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share">
                          <IconButton onClick={(e) => {
                            e.stopPropagation();
                            generateShareLink(folder.path, true);
                          }}>
                            <LinkIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Files</Typography>
              <Grid container spacing={3}>
                {filesList.map(file => (
                  <Grid item key={file.path} xs={12} sm={6} md={4} lg={3}>
                    <Card 
                      variant="outlined"
                      sx={{
                        borderColor: selectedFiles.includes(file.path) ? 'primary.main' : 'divider',
                        backgroundColor: selectedFiles.includes(file.path) ? 'primary.lightest' : 'background.paper',
                        '&:hover': {
                          boxShadow: 2,
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      <CardActionArea onClick={() => handleFileSelect(file.path)}>
                        <CardContent sx={{ textAlign: 'center', position: 'relative' }}>
                          <Checkbox
                            checked={selectedFiles.includes(file.path)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleFileSelect(file.path);
                            }}
                            sx={{ 
                              position: 'absolute', 
                              top: 0, 
                              left: 0,
                              zIndex: 1 
                            }}
                          />
                          {getFileIcon(file.name, false)}
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              mt: 1,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatBytes(file.size)} • {formatDate(file.modified)}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                      <CardActions sx={{ justifyContent: 'center' }}>
                        <Tooltip title="Download">
                          <IconButton onClick={() => downloadItem(file)}>
                            <DownloadIcon color="action" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share">
                          <IconButton onClick={() => generateShareLink(file.path, false)}>
                            <LinkIcon color="action" />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <List>
              {folders.map(folder => (
                <ListItem 
                  key={folder.path}
                  button
                  onClick={() => handleFolderClick(folder.path)}
                  sx={{ 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <ListItemIcon>
                    <FolderIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={folder.name}
                    secondary={`Modified: ${formatDate(folder.modified)}`}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Download">
                      <IconButton onClick={() => downloadItem(folder)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share">
                      <IconButton onClick={() => generateShareLink(folder.path, true)}>
                        <LinkIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {filesList.map(file => (
                <ListItem 
                  key={file.path}
                  sx={{ 
                    backgroundColor: selectedFiles.includes(file.path) ? 'primary.lightest' : 'transparent',
                    border: '1px solid',
                    borderColor: selectedFiles.includes(file.path) ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Checkbox
                    checked={selectedFiles.includes(file.path)}
                    onChange={() => handleFileSelect(file.path)}
                  />
                  <ListItemIcon>
                    {getFileIcon(file.name)}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${formatBytes(file.size)} • Modified: ${formatDate(file.modified)}`}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Download">
                      <IconButton onClick={() => downloadItem(file)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share">
                      <IconButton onClick={() => generateShareLink(file.path, false)}>
                        <LinkIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        {shareLink.open && (
          <Paper elevation={3} sx={{ 
            mt: 3,
            p: 3,
            borderRadius: 3,
            backgroundColor: 'white',
            maxWidth: 1200,
            width: '100%',
            mx: 'auto'
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
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
                {shareLink.apiKey}
              </Typography>
              <Button 
                startIcon={<FileCopyIcon />}
                onClick={() => copyToClipboard(shareLink.apiKey)}
                variant="outlined"
                size="small"
              >
                Copy
              </Button>
            </Box>
            
            <Box component="pre" sx={{ 
              backgroundColor: '#1e1e1e',
              p: 3,
              borderRadius: 2,
              overflowX: 'auto',
              fontFamily: '"Fira Code", monospace',
              color: '#d4d4d4',
              boxShadow: 3,
              mt: 3
            }}>
              <code>
                <Box component="span" sx={{ color: '#569cd6' }}>{`// Download with curl`}</Box>{`\n`}
                <Box component="span" sx={{ color: '#ce9178' }}>{`curl -X GET "`}</Box>
                <Box component="span" sx={{ color: '#9cdcfe' }}>{shareLink.apiKey}</Box>
                <Box component="span" sx={{ color: '#ce9178' }}>{`"`}</Box>
                <Box component="span" sx={{ color: '#d7ba7d' }}>{` --output filename.ext`}</Box>{`\n\n`}

                <Box component="span" sx={{ color: '#569cd6' }}>{`// Download with wget`}</Box>{`\n`}
                <Box component="span" sx={{ color: '#ce9178' }}>{`wget "`}</Box>
                <Box component="span" sx={{ color: '#9cdcfe' }}>{shareLink.apiKey}</Box>
                <Box component="span" sx={{ color: '#ce9178' }}>{`"`}</Box>
                <Box component="span" sx={{ color: '#d7ba7d' }}>{` -O filename.ext`}</Box>
              </code>
            </Box>
          </Paper>
        )}

        <Menu
          open={contextMenu.open}
          anchorEl={contextMenu.anchorEl}
          onClose={() => setContextMenu({ open: false, file: null, anchorEl: null })}
        >
          <MenuItem onClick={() => {
            if (contextMenu.file) {
              generateShareLink(contextMenu.file.path, !contextMenu.file.is_file);
            }
            setContextMenu({ open: false, file: null, anchorEl: null });
          }}>
            <ListItemIcon><LinkIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Get Share Link</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            if (contextMenu.file) {
              downloadItem(contextMenu.file);
            }
            setContextMenu({ open: false, file: null, anchorEl: null });
          }}>
            <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
        </Menu>

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
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}