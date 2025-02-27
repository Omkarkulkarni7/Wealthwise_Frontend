import React from "react";
import { Container, Box, Typography, Button, Paper, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";

// Styled components
const GradientBackground = styled(Box)({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #8EC5FC 0%, #E0C3FC 100%)",
  textAlign: "center",
  padding: 4,
});

const WelcomeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: "12px 30px",
  fontWeight: 600,
  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  textTransform: "none",
  fontSize: "1rem",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
  },
}));

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <GradientBackground>
      <Container maxWidth="sm">
        <WelcomeCard elevation={6}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <img
              src="/ww.png"
              alt="WealthWise Logo"
              style={{ width: "150px", marginBottom: "30px" }}
            />
            
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                color: "#333",
                mb: 3,
                background: "linear-gradient(45deg, #2196F3, #8C5CEE)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome to WealthWise
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 4,
                maxWidth: "80%",
                fontSize: "1.1rem",
              }}
            >
              Your personal finance companion that helps you manage, track and grow your wealth
            </Typography>
            
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <StyledButton
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/login")}
                >
                  Log in
                </StyledButton>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <StyledButton
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate("/register")}
                >
                  Register
                </StyledButton>
              </Grid>
            </Grid>
          </Box>
        </WelcomeCard>
      </Container>
    </GradientBackground>
  );
};

export default Welcome;