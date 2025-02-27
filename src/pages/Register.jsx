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
  Grid,
  Stepper,
  Step,
  StepLabel
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Person
} from "@mui/icons-material";
import API from "../utils/api";

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

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  
  const navigate = useNavigate();

  // Validate password
  const validatePassword = (pass) => {
    if (pass.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // Validate form
  const isFormValid = () => {
    return (
      name && 
      email && 
      password && 
      confirmPassword && 
      password === confirmPassword &&
      !passwordError
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (!validatePassword(password)) {
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      await API.post("/auth/register", { name, email, password });
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
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
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Join WealthWise and start your financial journey
          </Typography>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            variant="outlined"
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            fullWidth
            label="Email"
            type="email"
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
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
            required
            error={!!passwordError}
            helperText={passwordError}
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
          
          <TextField
            fullWidth
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            error={confirmPassword && password !== confirmPassword}
            helperText={
              confirmPassword && password !== confirmPassword
                ? "Passwords do not match"
                : ""
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <SubmitButton
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading || !isFormValid()}
          >
            {loading ? <CircularProgress size={24} /> : "Register"}
          </SubmitButton>
        </form>
        
        <Grid container justifyContent="center" mt={3}>
          <Grid item>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#1976d2", textDecoration: "none", fontWeight: 600 }}>
                Login here
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </StyledPaper>
    </StyledContainer>
  );
};

export default Register;