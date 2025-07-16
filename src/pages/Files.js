import { useState, useEffect, useRef } from 'react';
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
  ListItemSecondaryAction,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Menu,
  MenuItem
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SearchIcon from '@mui/icons-material/Search';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import ArchiveIcon from '@mui/icons-material/Archive';
import CodeIcon from '@mui/icons-material/Code';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { saveAs } from 'file-saver';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const keyHex = '603deb1015ca71be2b73aef0857d7781f352c073b6108d72d9810a30914dff4f'; // 32 bytes
const ivHex = '000102030405060708090a0b0c0d0e0f'; // 16 bytes
const MAX_PARALLEL_DOWNLOADS = 10;
const MAX_SELECTION_LIMIT = 10;
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.0.236:9900';

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

  return encrypted.toString(); // Base64 string
}

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
  const [shareLink, setShareLink] = useState({
    apiKey: '',
    open: false
  });
  const [downloadState, setDownloadState] = useState({
    active: false,
    completed: 0,
    total: 0,
    progress: 0,
    speed: 0,
    timeRemaining: 0,
    showCancel: false,
    downloads: {}
  });
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    open: false,
    file: null,
    anchorEl: null
  });
  const cancelControllers = useRef(new Map());
  const downloadQueue = useRef([]);
  const activeDownloads = useRef(0);
  
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0 || isNaN(bytes)) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
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

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch(extension) {
      case 'pdf': return <PictureAsPdfIcon color="error" />;
      case 'jpg': case 'jpeg': case 'png': case 'gif': case 'svg': case 'webp':
        return <ImageIcon color="primary" />;
      case 'txt': case 'doc': case 'docx': case 'odt':
        return <DescriptionIcon color="info" />;
      case 'mp3': case 'wav': case 'ogg':
        return <AudioFileIcon color="action" />;
      case 'mp4': case 'mov': case 'avi':
        return <VideoFileIcon color="secondary" />;
      case 'zip': case 'rar': case '7z':
        return <ArchiveIcon color="warning" />;
      case 'js': case 'jsx': case 'ts': case 'html': case 'css': case 'json':
        return <CodeIcon color="success" />;
      default: return <InsertDriveFileIcon color="inherit" />;
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async (path = '') => {
    setLoading(true);
    try {
      const response = await api.get('/files/files' + (path ? `?path=${encryptText(path)}` : ''));
      setFiles(response.data.files);
      setCurrentPath(response.data.path);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch files: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (fileId, isFile) => {
    if (!isFile) return;
    
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        if (prev.length >= MAX_SELECTION_LIMIT) {
          setSnackbar({
            open: true,
            message: `Maximum ${MAX_SELECTION_LIMIT} files can be selected`,
            severity: 'warning'
          });
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

  const handleContextMenu = (event, file) => {
    event.preventDefault();
    setContextMenu({
      open: true,
      file,
      anchorEl: event.currentTarget
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({
      open: false,
      file: null,
      anchorEl: null
    });
  };

  const downloadSingleFile = async (file) => {
    let localToken = localStorage.getItem("authToken");
    if (localToken?.startsWith("b'") && localToken.endsWith("'")) {
      localToken = localToken.slice(2, -1);
    }

    if (!localToken) {
      setSnackbar({
        open: true,
        message: "Authentication failed, token missing",
        severity: "error",
      });
      return;
    }

    const controller = new AbortController();
    cancelControllers.current.set(file.path, controller);

    try {
      setDownloadState(prev => ({
        ...prev,
        active: true,
        completed: 0,
        total: 1,
        showCancel: true,
        downloads: {
          [file.path]: {
            progress: 0,
            downloaded: 0,
            total: file.size || 0,
            speed: 0,
            active: true
          }
        }
      }));

      const res = await api.post("/files/generate-download-token", { path: encryptText(file.path) });
      const apiToken = res.data.token;
      if (!apiToken) throw new Error("No token received from server");

      const response = await fetch(
        `${API_BASE_URL}/files/download/${apiToken}`,
        {
          headers: { Authorization: `Bearer ${localToken}` },
          signal: controller.signal
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const contentLength = parseInt(response.headers.get('content-length'), 10) || file.size || 0;
      const reader = response.body.getReader();
      let receivedLength = 0;
      const chunks = [];
      let lastUpdateTime = Date.now();
      let lastBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        const currentTime = Date.now();
        const timeDiff = (currentTime - lastUpdateTime) / 1000;
        const bytesDiff = receivedLength - lastBytes;

        if (timeDiff > 0.5) {
          const speed = bytesDiff / timeDiff;
          setDownloadState(prev => ({
            ...prev,
            downloads: {
              ...prev.downloads,
              [file.path]: {
                ...prev.downloads[file.path],
                progress: Math.round((receivedLength / contentLength) * 100),
                downloaded: receivedLength,
                speed: speed,
                active: true
              }
            }
          }));

          lastUpdateTime = currentTime;
          lastBytes = receivedLength;
        }
      }

      const blob = new Blob(chunks);
      saveAs(blob, file.name);

      setDownloadState(prev => ({
        ...prev,
        completed: 1,
        active: false,
        showCancel: false,
        downloads: {
          ...prev.downloads,
          [file.path]: {
            ...prev.downloads[file.path],
            active: false,
            progress: 100
          }
        }
      }));

    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(`Download failed for ${file.name}:`, err);
        setSnackbar({
          open: true,
          message: `Failed to download ${file.name}: ${err.message}`,
          severity: "error",
        });
      }
      setDownloadState(prev => ({
        ...prev,
        active: false,
        showCancel: false,
        downloads: {
          ...prev.downloads,
          [file.path]: {
            ...prev.downloads[file.path],
            active: false,
            error: true
          }
        }
      }));
    } finally {
      cancelControllers.current.delete(file.path);
    }
  };

  const processDownloadQueue = () => {
    while (activeDownloads.current < MAX_PARALLEL_DOWNLOADS && downloadQueue.current.length > 0) {
      const file = downloadQueue.current.shift();
      activeDownloads.current += 1;
      downloadSingleFile(file);
    }

    if (activeDownloads.current === 0 && downloadQueue.current.length === 0) {
      setDownloadState(prev => ({
        ...prev,
        active: false,
        showCancel: false
      }));
      setSelectedFiles([]);
    }
  };

  const startParallelDownloads = async (filesToDownload) => {
    if (filesToDownload.length === 0) return;

    setDownloadState({
      active: true,
      completed: 0,
      total: filesToDownload.length,
      progress: 0,
      speed: 0,
      timeRemaining: 0,
      showCancel: true,
      downloads: filesToDownload.reduce((acc, file) => {
        acc[file.path] = {
          progress: 0,
          downloaded: 0,
          total: file.size || 0,
          speed: 0,
          active: false
        };
        return acc;
      }, {})
    });

    downloadQueue.current = [...filesToDownload];
    activeDownloads.current = 0;
    processDownloadQueue();
  };

  const downloadSelectedFiles = async () => {
    if (selectedFiles.length === 0) return;

    const filesToDownload = files.filter(f => 
      selectedFiles.includes(f.path) && f.is_file
    );

    if (filesToDownload.length === 0) {
      setSnackbar({
        open: true,
        message: 'No valid files selected for download',
        severity: 'warning'
      });
      return;
    }

    if (filesToDownload.length === 1) {
      await downloadSingleFile(filesToDownload[0]);
      return;
    }

    startParallelDownloads(filesToDownload);
  };

  const cancelAllDownloads = () => {
    cancelControllers.current.forEach(controller => {
      controller.abort();
    });
    cancelControllers.current.clear();
    downloadQueue.current = [];
    activeDownloads.current = 0;
    setConfirmCancelOpen(false);
    setDownloadState(prev => ({ ...prev, active: false, showCancel: false }));
  };

  const generateShareLink = async (path) => {
    try {
      setShareLink({
        apiKey: `http://192.168.0.236/api/apikeydownload?token=${encryptText(path)}&api_key=YOUR_API_KEY`,
        open: true
      });
      
      setSnackbar({
        open: true,
        message: 'API share link generated',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to generate share link: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: 'Link copied to clipboard',
      severity: 'success'
    });
  };

  useEffect(() => {
    if (downloadState.active) {
      const totalFiles = downloadState.total;
      const completedFiles = downloadState.completed;
      
      let totalProgress = 0;
      let totalDownloaded = 0;
      let totalSize = 0;
      let totalSpeed = 0;
      
      Object.values(downloadState.downloads).forEach(download => {
        totalProgress += download.progress;
        totalDownloaded += download.downloaded;
        totalSize += download.total || 0;
        totalSpeed += download.speed || 0;
      });

      const avgProgress = totalFiles > 0 
        ? Math.round((completedFiles * 100 + totalProgress) / totalFiles)
        : 0;

      const timeRemaining = totalSpeed > 0 
        ? (totalSize - totalDownloaded) / totalSpeed 
        : 0;

      setDownloadState(prev => ({
        ...prev,
        progress: avgProgress,
        speed: totalSpeed,
        timeRemaining: timeRemaining
      }));
    }
  }, [downloadState.downloads, downloadState.completed]);

  return (
    <Box display="flex" sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        {/* Download Progress Indicator */}
        {downloadState.active && (
          <Paper elevation={3} sx={{ mb: 3, p: 2, position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Badge 
                badgeContent={`${downloadState.completed}/${downloadState.total}`} 
                color="primary"
                sx={{ mr: 2 }}
              >
                <DownloadIcon color="primary" />
              </Badge>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">
                  Downloading {downloadState.total} file{downloadState.total !== 1 ? 's' : ''}
                  {downloadState.completed > 0 && ` (${downloadState.completed} completed)`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {downloadState.progress}% complete
                </Typography>
              </Box>
              {downloadState.showCancel && (
                <IconButton 
                  size="small" 
                  onClick={() => setConfirmCancelOpen(true)}
                  disabled={!downloadState.active}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={downloadState.progress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {formatBytes(downloadState.speed)}/s
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {downloadState.timeRemaining > 0 && `${formatTime(downloadState.timeRemaining)} remaining`}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Individual download progress */}
        {downloadState.active && Object.keys(downloadState.downloads).length > 0 && (
          <Paper elevation={3} sx={{ mb: 3, p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Download Details</Typography>
            <List dense>
              {Object.entries(downloadState.downloads).map(([path, download]) => {
                const file = files.find(f => f.path === path);
                return (
                  <ListItem key={path}>
                    <ListItemIcon>
                      {file && getFileIcon(file.name)}
                    </ListItemIcon>
                    <ListItemText
                      primary={file?.name || path.split('/').pop()}
                      secondary={
                        <Box sx={{ width: '100%' }}>
                          <LinearProgress
                            variant="determinate"
                            value={download.progress}
                            sx={{ height: 4, my: 1 }}
                            color={download.error ? 'error' : 'primary'}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption">
                              {download.progress}%
                            </Typography>
                            <Typography variant="caption">
                              {formatBytes(download.downloaded)} of {formatBytes(download.total)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        )}

        {/* Main content */}
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
                  onClick={downloadSelectedFiles}
                  sx={{ borderRadius: 2 }}
                  disabled={downloadState.active}
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
                    mb: 0.5,
                    backgroundColor: !file.is_file ? 'rgba(25, 118, 210, 0.04)' : 'inherit'
                  }}
                  onContextMenu={(e) => file.is_file && handleContextMenu(e, file)}
                >
                  <Checkbox 
                    checked={selectedFiles.includes(file.path)}
                    onChange={() => handleFileSelect(file.path, file.is_file)}
                    sx={{ mr: 1 }}
                    disabled={downloadState.active || !file.is_file}
                  />
                  
                  <ListItemIcon>
                    {file.is_file ? (
                      <Avatar sx={{ 
                        bgcolor: 'transparent', 
                        width: 36, 
                        height: 36,
                        color: 'text.secondary'
                      }}>
                        {getFileIcon(file.name)}
                      </Avatar>
                    ) : (
                      <Avatar sx={{ 
                        bgcolor: 'secondary.light', 
                        width: 36, 
                        height: 36 
                      }}>
                        <FolderIcon fontSize="medium" sx={{ color: 'secondary.main' }} />
                      </Avatar>
                    )}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Typography 
                        onClick={() => file.is_file ? null : handleFolderClick(file.path)}
                        sx={{ 
                          cursor: file.is_file ? 'default' : 'pointer',
                          fontWeight: file.is_file ? 500 : 600,
                          color: !file.is_file ? 'primary.main' : 'inherit'
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
                          onClick={() => file.is_file ? downloadSingleFile(file) : null}
                          size="small"
                          sx={{ 
                            backgroundColor: 'action.selected',
                            '&:hover': { backgroundColor: 'action.hover' }
                          }}
                          disabled={downloadState.active || !file.is_file}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {file.is_file && (
                        <Tooltip title="More actions">
                          <IconButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContextMenu(e, file);
                            }}
                            size="small"
                            sx={{ 
                              backgroundColor: 'action.selected',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                            disabled={downloadState.active}
                          >
                            <MoreVertIcon fontSize="small" />
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

        {/* API Share Link Panel */}
        {shareLink.open && (
          <Paper elevation={0} sx={{  mt: 3,
                                      p: 3,
                                      borderRadius: 3,
                                      backgroundColor: 'white',
                                      maxWidth: 1200, // adjust as needed
                                      width: '100%',
                                      mx: 'auto' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              API Share Link
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
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              This link requires an API key for access
            </Typography>
            
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

        {/* Context Menu */}
        <Menu
          open={contextMenu.open}
          anchorEl={contextMenu.anchorEl}
          onClose={handleCloseContextMenu}
          onClick={handleCloseContextMenu}
        >
          <MenuItem 
            onClick={() => {
              if (contextMenu.file) {
                generateShareLink(contextMenu.file.path);
              }
            }}
            disabled={downloadState.active}
          >
            <ListItemIcon>
              <LinkIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Get API Share Link</ListItemText>
          </MenuItem>
        </Menu>

        {/* Snackbar for notifications */}
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

        {/* Cancel Download Confirmation Dialog */}
        <Dialog
          open={confirmCancelOpen}
          onClose={() => setConfirmCancelOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Cancel Downloads?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to cancel all active downloads? Any downloaded data will be lost.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmCancelOpen(false)}>No, Continue</Button>
            <Button onClick={cancelAllDownloads} color="error">Yes, Cancel All</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}