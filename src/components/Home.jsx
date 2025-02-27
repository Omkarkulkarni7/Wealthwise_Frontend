import React from "react";
import { Typography, Container, Box, Paper, Grid, Avatar, Card, CardContent, Chip, useTheme, useMediaQuery, IconButton, Slide, CircularProgress } from "@mui/material";
import { EmailOutlined, AdminPanelSettingsOutlined, BadgeOutlined, SettingsOutlined, NotificationsOutlined } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const Home = () => {
    const { user, loading } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box 
            sx={{ 
                minHeight: "100vh", 
                background: "white",
                py: { xs: 2, md: 4 },
                display: "flex",
                alignItems: "center",
                marginTop: -4 // Adjust this value to shift the structure upward
            }}
        >
            <Container maxWidth="md">
                <Slide direction="down" in={true} mountOnEnter unmountOnExit>
                    <Paper 
                        elevation={4} 
                        sx={{ 
                            p: { xs: 2, sm: 4 }, 
                            borderRadius: 4, 
                            background: "linear-gradient(135deg, #8ECFFF, #2C3E50)", 
                            color: "white",
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        {/* Top actions */}
                        <Box sx={{ position: "absolute", right: 16, top: 16, display: "flex", gap: 1 }}>
                            <IconButton size="small" sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)" }}>
                                <NotificationsOutlined fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)" }}>
                                <SettingsOutlined fontSize="small" />
                            </IconButton>
                        </Box>

                        {user && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Avatar 
                                    sx={{ 
                                        width: { xs: 70, md: 90 }, 
                                        height: { xs: 70, md: 90 }, 
                                        margin: "0 auto 15px", 
                                        bgcolor: "rgba(255,255,255,0.2)", 
                                        fontSize: { xs: 28, md: 36 },
                                        border: "4px solid rgba(255,255,255,0.2)"
                                    }}
                                >
                                    {user.name.charAt(0).toUpperCase()}
                                </Avatar>

                                <Typography variant={isMobile ? "h5" : "h4"} gutterBottom fontWeight="bold">
                                    Welcome, {user.name}!
                                </Typography>

                                <Chip 
                                    label={`${user.role.toUpperCase()} ACCOUNT`}
                                    sx={{ 
                                        bgcolor: "rgba(255,255,255,0.15)", 
                                        color: "white", 
                                        mb: 3,
                                        fontWeight: "medium" 
                                    }} 
                                />

                                <Grid 
                                    container 
                                    spacing={isMobile ? 2 : 3} 
                                    justifyContent="center"
                                >
                                    <Grid item xs={12} sm={4}>
                                        <Card 
                                            sx={{ 
                                                height: '100%', 
                                                borderRadius: 3,
                                                transition: "transform 0.2s",
                                                "&:hover": {
                                                    transform: "translateY(-5px)"
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <Box display="flex" alignItems="center" mb={1}>
                                                    <EmailOutlined color="primary" sx={{ mr: 1 }} />
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Email Address
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {user.email}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <Card 
                                            sx={{ 
                                                height: '100%', 
                                                borderRadius: 3,
                                                transition: "transform 0.2s",
                                                "&:hover": {
                                                    transform: "translateY(-5px)"
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <Box display="flex" alignItems="center" mb={1}>
                                                    <AdminPanelSettingsOutlined color="primary" sx={{ mr: 1 }} />
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Account Type
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body1" fontWeight="medium" textTransform="capitalize">
                                                    {user.role}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <Card 
                                            sx={{ 
                                                height: '100%', 
                                                borderRadius: 3,
                                                transition: "transform 0.2s",
                                                "&:hover": {
                                                    transform: "translateY(-5px)"
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <Box display="flex" alignItems="center" mb={1}>
                                                    <BadgeOutlined color="primary" sx={{ mr: 1 }} />
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        User ID
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {user.userId}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </Paper>
                </Slide>
            </Container>
        </Box>
    );
};

export default Home;