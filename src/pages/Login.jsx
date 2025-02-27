import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Paper, 
  InputAdornment, 
  IconButton,
  CircularProgress,
  Alert,
  Grid
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";



const StyledContainer = styled(Box)({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #8EC5FC 0%, #E0C3FC 100%)",
  padding: "24px",
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  width: "100%",
  maxWidth: "450px",
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  padding: "12px 0",
  marginTop: theme.spacing(3),
  borderRadius: 8,
  fontWeight: 600,
  textTransform: "none",
  fontSize: "1rem",
}));

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const { login } = useAuth();

  // Update Login.jsx handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
        const response = await API.post("/auth/login", { email, password });
        localStorage.setItem("accessToken", response.data.accessToken);
        
        // Call login to refresh user data from the backend
        await login();
        
        navigate("/dashboard/home");
    } catch (err) {
        setError(err.response?.data?.message || "Invalid email or password");
    } finally {
        setLoading(false);
    }
};

  return (
    <StyledContainer>
      <StyledPaper>
        <Box textAlign="center" mb={4}>
          <img
            src="/ww.png"
            alt="WealthWise Logo"
            style={{ width: "100px", marginBottom: "20px" }}
          />
          <Typography variant="h4" fontWeight="700" color="primary.main">
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Sign in to access your WealthWise account
          </Typography>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <SubmitButton
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading || !email || !password}
          >
            {loading ? <CircularProgress size={24} /> : "Sign In"}
          </SubmitButton>
        </form>
        
        <Grid container justifyContent="center" mt={3}>
          <Grid item>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "#1976d2", textDecoration: "none", fontWeight: 600 }}>
                Register here
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </StyledPaper>
    </StyledContainer>
  );
};

export default Login;