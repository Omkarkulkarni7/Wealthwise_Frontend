import React, { useState, useEffect } from "react";
import { 
  Typography, 
  Container, 
  Box, 
  TextField, 
  Autocomplete, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert,
  Grid,
  Chip,
  Divider,
  InputAdornment,
  Skeleton,
  Snackbar,
  IconButton,
  Tooltip
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SellIcon from "@mui/icons-material/Sell";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";

const Stocks = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [stockHistory, setStockHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        performSearch(searchQuery);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setSearchLoading(true);
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await API.get(`/stocks/search?query=${query}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSearchResults(response.data);
    } catch (err) {
      showNotification("Error fetching search results", "error");
      console.log(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    if (event.target.value.length <= 2) {
      setSearchResults([]);
    }
  };

  const handleSelectStock = async (event, value) => {
    resetMessages();
    if (!value) {
      setSelectedStock(null);
      return;
    }
    
    setLoading(true);
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await API.get(`/stocks/price/${value.symbol}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSelectedStock(response.data);
      
      // Fetch recent price history (assuming endpoint exists)
      try {
        const historyResponse = await API.get(`/stocks/history/${value.symbol}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setStockHistory(historyResponse.data || []);
      } catch (historyErr) {
        console.log("Could not fetch price history", historyErr);
        setStockHistory([]);
      }
    } catch (err) {
      showNotification("Error fetching stock details", "error");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshStockData = async () => {
    if (!selectedStock) return;
    
    setRefreshing(true);
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await API.get(`/stocks/price/${selectedStock.symbol}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSelectedStock(response.data);
      showNotification("Stock data refreshed", "info");
    } catch (err) {
      showNotification("Failed to refresh stock data", "error");
    } finally {
      setRefreshing(false);
    }
  };

  const handleBuyStock = async () => {
    await executeStockTransaction("buy");
  };

  const handleSellStock = async () => {
    await executeStockTransaction("sell");
  };

  const executeStockTransaction = async (transactionType) => {
    if (!validateQuantity()) return;
    
    setLoading(true);
    resetMessages();
    const accessToken = localStorage.getItem("accessToken");
    
    try {
      const response = await API.post(
        `/stocks/${transactionType}`,
        { user_id: user.userId, symbol: selectedStock.symbol, quantity: Number(quantity) },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      showNotification(response.data.message, "success");
      setQuantity(""); // Clear the quantity field
    } catch (err) {
      const errorMessage = err.response?.data?.error || `Error ${transactionType === "buy" ? "buying" : "selling"} stock. Please try again.`;
      showNotification(errorMessage, "error");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const validateQuantity = () => {
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      showNotification("Please enter a valid quantity", "error");
      return false;
    }
    return true;
  };

  const resetMessages = () => {
    setError("");
  };

  const showNotification = (message, severity) => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const getPriceChangeColor = (change) => {
    if (!change) return "inherit";
    return change > 0 ? "success.main" : "error.main";
  };

  const getPriceChangeIcon = (change) => {
    if (!change) return null;
    return change > 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />;
  };

  const calculateTotalCost = () => {
    if (!selectedStock || !quantity || isNaN(quantity)) return 0;
    return (Number(selectedStock.price) * Number(quantity)).toFixed(2);
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #8EC5FC, #E0C3FC)", padding: 4 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ padding: 4, marginBottom: 4, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom fontWeight="600" sx={{ color: "primary.main" }}>
            Stock Trading Platform
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Search for stocks, view real-time prices, and execute trades easily.
          </Typography>
          
          <Autocomplete
            options={searchResults}
            getOptionLabel={(option) => `${option.symbol} - ${option.company_name}`}
            loading={searchLoading}
            onInputChange={handleSearch}
            onChange={handleSelectStock}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Search for a stock" 
                variant="outlined" 
                fullWidth 
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                helperText="Type at least 3 characters to search"
              />
            )}
            noOptionsText="No stocks found. Try a different search term."
          />

          {selectedStock ? (
            <Box sx={{ marginTop: 4 }}>
              <Paper 
                elevation={4} 
                sx={{ 
                  padding: 4, 
                  borderRadius: 2,
                  background: "linear-gradient(145deg, #ffffff, #f0f4f8)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
                  }
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {selectedStock.company_name} 
                    </Typography>
                    <Chip 
                      label={selectedStock.symbol} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ marginTop: 0.5 }}
                    />
                  </Box>
                  <Tooltip title="Refresh stock data">
                    <IconButton onClick={refreshStockData} disabled={refreshing}>
                      {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Divider sx={{ marginY: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ marginY: 2 }}>
                      <Typography variant="body2" color="text.secondary">Current Price</Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="h4" fontWeight="bold" color="primary">
                          {selectedStock.price} {selectedStock.currency}
                        </Typography>
                        
                        {selectedStock.price_change && (
                          <Box 
                            sx={{ 
                              display: "flex", 
                              alignItems: "center", 
                              color: getPriceChangeColor(selectedStock.price_change),
                              marginLeft: 2 
                            }}
                          >
                            {getPriceChangeIcon(selectedStock.price_change)}
                            <Typography variant="body2" sx={{ marginLeft: 0.5 }}>
                              {selectedStock.price_change > 0 ? "+" : ""}{selectedStock.price_change}%
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary">
                        Last Updated: {new Date(selectedStock.last_updated * 1000).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ marginY: 3 }}>
                      <TextField
                        label="Quantity"
                        variant="outlined"
                        fullWidth
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        type="number"
                        InputProps={{
                          inputProps: { min: 1 },
                        }}
                        helperText={
                          quantity && !isNaN(quantity) && Number(quantity) > 0 
                            ? `Total cost: ${calculateTotalCost()} ${selectedStock.currency}`
                            : "Enter the number of shares"
                        }
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      justifyContent: "center", 
                      height: "100%" 
                    }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleBuyStock}
                        disabled={loading}
                        startIcon={<ShoppingCartIcon />}
                        sx={{ 
                          marginBottom: 2, 
                          padding: "12px", 
                          backgroundColor: "primary.main",
                          "&:hover": {
                            backgroundColor: "primary.dark"
                          }
                        }}
                      >
                        {loading ? <CircularProgress size={24} /> : "Buy Stock"}
                      </Button>
                      
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSellStock}
                        disabled={loading}
                        startIcon={<SellIcon />}
                        sx={{ 
                          padding: "12px",
                          backgroundColor: "primary.main",
                          "&:hover": {
                            backgroundColor: "primary.dark"
                          }
                        }}
                      >
                        {loading ? <CircularProgress size={24} /> : "Sell Stock"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          ) : (
            <Box sx={{ 
              marginTop: 6, 
              textAlign: "center", 
              padding: 6, 
              backgroundColor: "rgba(0,0,0,0.02)", 
              borderRadius: 2
            }}>
              <TrendingUpIcon sx={{ fontSize: 60, color: "primary.light", marginBottom: 2, opacity: 0.7 }} />
              <Typography variant="h6" color="text.secondary">
                Search and select a stock to begin trading
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          variant="filled"
          sx={{ width: '100%' }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseNotification}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Stocks;