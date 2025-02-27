import React, { useState } from "react";
import { 
  Typography, 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Box, 
  CircularProgress, 
  Alert, 
  Grid, 
  InputAdornment,
  Divider,
  Slide,
  IconButton,
  useTheme
} from "@mui/material";
import { 
  PersonOutlined, 
  AttachMoneyOutlined, 
  SendOutlined,
  KeyboardBackspaceOutlined,
  HistoryOutlined 
} from "@mui/icons-material";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";

const Pay = () => {
  const { user } = useAuth();
  const [receiverId, setReceiverId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const theme = useTheme();
  
  const handleSendMoney = async () => {
    if (!receiverId.trim() || !amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Please enter a valid recipient ID and amount");
      return;
    }
    
    setLoading(true);
    setMessage("");
    setError("");
    
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await API.post(
        "/payments/send",
        { senderId: user.userId, receiverId, amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setMessage(response.data.message);
      setReceiverId("");
      setAmount("");
      
      // Scroll to the success message
      setTimeout(() => {
        document.getElementById("message-container")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
    setLoading(false);
  };
  
  return (
    <Box 
      sx={{ 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #8EC5FC, #E0C3FC)", 
        padding: { xs: 2, sm: 4 },
        display: "flex",
        alignItems: "center"
      }}
    >
      <Container maxWidth="sm">
        <Slide direction="up" in={true} mountOnEnter unmountOnExit>
          <Paper 
            elevation={6} 
            sx={{ 
              padding: { xs: 3, sm: 4 }, 
              borderRadius: 4, 
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)"
            }}
          >
            {/* Header Section */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center">
                <IconButton 
                  sx={{ mr: 1 }}
                  onClick={() => window.history.back()}
                >
                  <KeyboardBackspaceOutlined />
                </IconButton>
                <Typography variant="h5" fontWeight="600" color="primary">
                  Make a Payment
                </Typography>
              </Box>
              <IconButton color="primary" title="Transaction History">
                <HistoryOutlined />
              </IconButton>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {/* Payment Form */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Enter recipient details
              </Typography>
              
              <TextField
                label="Recipient ID"
                variant="outlined"
                fullWidth
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlined color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
              
              <TextField
                id="amount-field"
                label="Amount"
                variant="outlined"
                fullWidth
                value={amount}
                onChange={(e) => {
                  // Only allow numbers and one decimal point
                  const value = e.target.value;
                  if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
                    setAmount(value);
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyOutlined color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleSendMoney}
                disabled={loading}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "bold"
                }}
                endIcon={loading ? undefined : <SendOutlined />}
              >
                {loading ? <CircularProgress size={24} /> : "Send Payment"}
              </Button>
              
              <Box id="message-container" sx={{ mt: 2 }}>
                {message && (
                  <Slide direction="up" in={!!message}>
                    <Alert severity="success" variant="filled" sx={{ mb: 2 }}>
                      {message}
                    </Alert>
                  </Slide>
                )}
                
                {error && (
                  <Slide direction="up" in={!!error}>
                    <Alert severity="error" variant="filled" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  </Slide>
                )}
              </Box>
            </Box>
          </Paper>
        </Slide>
      </Container>
    </Box>
  );
};

export default Pay;