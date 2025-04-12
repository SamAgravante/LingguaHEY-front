import { Drawer, Toolbar, Divider, List, ListItem, ListItemButton, ListItemText, Grid, Button} from "@mui/material";
import { useNavigate, Outlet } from "react-router-dom";
  
const drawerWidth = 240;

const Layout = () => {
const navigate = useNavigate();

const routes = {
    'Home': '/Homepage',
    'Settings': '/settings',
    'Payment Method': '/payment',
    'Subscriptions': '/subscriptions',
    'Contact Us': '/contact',
    'Logout': '/logout',
};

return (
    <Grid container sx={{
    minHeight: '100vh',
    minWidth: '100vw',
    backgroundColor: '#FFCBE1',
    }}>
    <Drawer
        sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
        },
        }}
        variant="permanent"
        anchor="left"
    >
        <Toolbar />
        <Divider />
        <Button onClick={()=>navigate("/profilepage")}>
            Edit Profile
        </Button>
        <List>
        {Object.keys(routes).map((text) => (
            <ListItem key={text} disablePadding>
            <ListItemButton onClick={() => navigate(routes[text])}>
                <ListItemText primary={text} />
            </ListItemButton>
            </ListItem>
        ))}
        </List>
    </Drawer>

    <Grid item sx={{ flex: 1, ml: `${drawerWidth}px`, p: 2 }}>
        <Outlet />
    </Grid>
    </Grid>
);
};

export default Layout;
  