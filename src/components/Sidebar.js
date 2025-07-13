import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard, Folder, VpnKey } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

export default function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon><Dashboard /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/files">
          <ListItemIcon><Folder /></ListItemIcon>
          <ListItemText primary="Files" />
        </ListItem>
        <ListItem button component={Link} to="/keys">
          <ListItemIcon><VpnKey /></ListItemIcon>
          <ListItemText primary="API Keys" />
        </ListItem>
      </List>
    </Drawer>
  );
}