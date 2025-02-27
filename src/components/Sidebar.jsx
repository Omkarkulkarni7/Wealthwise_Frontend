import React, { useState, useEffect } from "react";
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Toolbar, 
  IconButton, 
  Box,
  Typography,
  ListItemIcon,
  Divider,
  useMediaQuery,
  AppBar,
  Avatar,
  Tooltip,
  Badge,
  Button,
  useTheme,
  Collapse,
  CircularProgress
} from "@mui/material";
import { 
  Home, 
  AccountBalance, 
  Payment, 
  ShowChart, 
  AttachMoney, 
  Menu as MenuIcon, 
  ExitToApp, 
  ChevronLeft,
  Notifications,
  Person,
  ExpandLess,
  ExpandMore
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

const Sidebar = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [open, setOpen] = useState(!isMobile);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openUserMenu, setOpenUserMenu] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user information
    useEffect(() => {
        const fetchUserInfo = async () => {
            if (user) {
                const accessToken = localStorage.getItem("accessToken");
                try {
                    const response = await API.get(`/user/${user.userId}`, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    setUserInfo(response.data);
                } catch (err) {
                    console.log(err);
                }
                setLoading(false);
            }
        };
        fetchUserInfo();
    }, [user]);

    // Update sidebar state when screen size changes
    useEffect(() => {
      setOpen(!isMobile);
      if (isMobile) {
        setMobileOpen(false);
      }
    }, [isMobile]);

    const menuItems = [
        { text: "Dashboard", path: "/dashboard/home", icon: <Home /> },
        { text: "Bank Account", path: "/dashboard/bank-account", icon: <AccountBalance /> },
        { text: "Payments", path: "/dashboard/pay", icon: <Payment /> },
        { text: "Stock Market", path: "/dashboard/stocks", icon: <ShowChart /> },
        { text: "My Investments", path: "/dashboard/investments", icon: <AttachMoney /> },
    ];
    
    const toggleDrawer = () => {
      if (isMobile) {
        setMobileOpen(!mobileOpen);
      } else {
        setOpen(!open);
      }
    };

    const handleNavigation = (path) => {
      navigate(path);
      if (isMobile) {
        setMobileOpen(false);
      }
    };

    // User Profile Section with loading state
    const userProfileSection = () => {
      if (loading) {
        return (
          <Box sx={{ px: 2, py: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={40} sx={{ color: 'white' }} />
          </Box>
        );
      }

      return (
        <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
          <Avatar 
            sx={{ 
              width: 70, 
              height: 70, 
              margin: '0 auto', 
              bgcolor: 'primary.light',
              border: '3px solid rgba(255,255,255,0.2)'
            }}
          >
            {userInfo?.name?.charAt(0).toUpperCase() || user?.name?.charAt(0) || "U"}
          </Avatar>
          <Typography variant="body1" sx={{ mt: 2, color: 'white', fontWeight: 600 }}>
            {userInfo?.name || user?.name || "User"}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {userInfo?.email || user?.email || "user@example.com"}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.5)' }}>
            {userInfo?.role || "User"}
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            sx={{ 
              mt: 2, 
              borderColor: 'rgba(255,255,255,0.3)', 
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
            onClick={() => handleNavigation('/dashboard/home')}
          >
            View Profile
          </Button>
        </Box>
      );
    };

    const drawerContent = (
      <>
        <Box sx={{ 
          display: "flex", 
          flexDirection: "column", 
          height: "100%", 
          overflow: "hidden"
        }}>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            p: 2, 
            justifyContent: open ? "space-between" : "center" 
          }}>
            {open && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <img 
                  src="/ww2.png" 
                  alt="Logo" 
                  style={{ 
                    height: "32px", 
                    marginRight: "10px",
                    filter: "brightness(0) invert(1)"
                  }} 
                />
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    fontWeight: 700, 
                    letterSpacing: 1, 
                    color: "white" 
                  }}>
                  WealthWise
                </Typography>
              </Box>
            )}
            
            {!open && (
              <img 
                src="/ww.png" 
                alt="Logo" 
                style={{ 
                  height: "32px",
                  filter: "brightness(0) invert(1)"
                }} 
              />
            )}

            {!isMobile && (
              <IconButton onClick={toggleDrawer} sx={{ color: "white" }}>
                {open ? <ChevronLeft /> : <MenuIcon />}
              </IconButton>
            )}
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

          {/* User Profile Section */}
          {(open || isMobile) && userProfileSection()}

          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

          {/* Navigation Menu */}
          <List component="nav" sx={{ flexGrow: 1, mt: 1, px: 1 }}>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  background: location.pathname === item.path ? 
                    "linear-gradient(90deg, rgba(0,98,255,0.5) 0%, rgba(0,98,255,0.2) 100%)" : 
                    "transparent",
                  "&:hover": { 
                    background: location.pathname === item.path ? 
                      "linear-gradient(90deg, rgba(0,98,255,0.6) 0%, rgba(0,98,255,0.3) 100%)" : 
                      "rgba(255,255,255,0.1)" 
                  },
                  pl: 2,
                  pr: 1,
                  py: 1
                }}
              >
                <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                {(open || isMobile) && (
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: 14,
                      fontWeight: location.pathname === item.path ? 600 : 400  
                    }} 
                  />
                )}
                {location.pathname === item.path && (
                  <Box 
                    sx={{ 
                      width: 4, 
                      height: 20, 
                      bgcolor: 'primary.light', 
                      borderRadius: 1,
                      ml: 1
                    }} 
                  />
                )}
              </ListItem>
            ))}
          </List>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

          {/* Logout Section */}
          <List sx={{ px: 1, mb: 2 }}>
            <ListItem
              button
              onClick={() => navigate("/login")}
              sx={{
                borderRadius: 1,
                "&:hover": { background: "rgba(255,255,255,0.1)" },
                pl: 2,
                pr: 1,
                py: 1
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                <ExitToApp />
              </ListItemIcon>
              {(open || isMobile) && (
                <ListItemText 
                  primary="Logout" 
                  primaryTypographyProps={{ 
                    fontSize: 14
                  }} 
                />
              )}
            </ListItem>
          </List>
        </Box>
      </>
    );

    // Mobile header for top app bar
    const mobileHeader = (
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "#2C3E50"
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img 
              src="/ww.png" 
              alt="Logo" 
              style={{ 
                height: "28px", 
                marginRight: "10px",
                filter: "brightness(0) invert(1)"
              }} 
            />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
              WealthWise
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: "flex" }}>
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Profile">
              <IconButton color="inherit">
                <Person />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
    );

    return (
      <>
        {isMobile && mobileHeader}
        
        {/* Desktop persistent drawer */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            open={open}
            sx={{
              width: open ? 250 : 72,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: open ? 250 : 72,
                background: "#2C3E50",
                color: "white",
                transition: "width 0.2s ease",
                overflow: "hidden",
                borderRight: "none",
                boxShadow: "0 0 20px rgba(0,0,0,0.1)"
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}
        
        {/* Mobile temporary drawer */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={toggleDrawer}
            sx={{
              "& .MuiDrawer-paper": {
                width: 280,
                background: "#2C3E50",
                color: "white",
                boxSizing: "border-box",
              },
            }}
            ModalProps={{
              keepMounted: true, // Better mobile performance
            }}
          >
            <Toolbar /> {/* Space for AppBar */}
            {drawerContent}
          </Drawer>
        )}
      </>
    );
};

export default Sidebar;