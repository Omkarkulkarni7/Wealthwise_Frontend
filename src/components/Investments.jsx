import React, { useEffect, useState, useMemo } from "react";
import { 
  Typography, 
  Container, 
  Box, 
  Paper, 
  Grid, 
  CircularProgress, 
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Skeleton,
  useMediaQuery,
  useTheme
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PieChartIcon from "@mui/icons-material/PieChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TableViewIcon from "@mui/icons-material/TableView";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";

const Investments = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("dashboard");
  const [timeRange, setTimeRange] = useState("1M");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Calculate portfolio statistics
  const portfolioStats = useMemo(() => {
    if (!investments.length) return {
      totalValue: 0,
      totalInvested: 0,
      totalReturn: 0,
      returnPercentage: 0,
      bestPerformer: null,
      worstPerformer: null
    };

    const totalValue = investments.reduce((sum, inv) => sum + (inv.current_price * inv.quantity), 0);
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.purchase_price * inv.quantity), 0);
    const totalReturn = totalValue - totalInvested;
    const returnPercentage = (totalReturn / totalInvested) * 100;

    // Find best and worst performers by percentage
    let bestPerformer = { performance: -Infinity };
    let worstPerformer = { performance: Infinity };

    investments.forEach(inv => {
      const performance = ((inv.current_price - inv.purchase_price) / inv.purchase_price) * 100;
      
      if (performance > bestPerformer.performance) {
        bestPerformer = { ...inv, performance };
      }
      
      if (performance < worstPerformer.performance) {
        worstPerformer = { ...inv, performance };
      }
    });

    return {
      totalValue: totalValue.toFixed(2),
      totalInvested: totalInvested.toFixed(2),
      totalReturn: totalReturn.toFixed(2),
      returnPercentage: returnPercentage.toFixed(2),
      bestPerformer,
      worstPerformer
    };
  }, [investments]);

  // Define chart colors
  const chartColors = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF", 
    "#FF6B6B", "#4ECDC4", "#1A535C", "#FF9F1C", "#011627"
  ];

  // Calculate allocation data for pie chart
  const allocationData = useMemo(() => {
    if (!investments.length) return [];
    
    const totalValue = investments.reduce((sum, inv) => sum + (inv.current_price * inv.quantity), 0);
    return investments.map((inv, index) => ({
      name: inv.stock_symbol,
      value: (inv.current_price * inv.quantity),
      percentage: ((inv.current_price * inv.quantity) / totalValue * 100).toFixed(1),
      color: chartColors[index % chartColors.length]
    }));
  }, [investments]);

  useEffect(() => {
    fetchInvestments();
  }, [user]);

  const fetchInvestments = async () => {
    setRefreshing(true);
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await API.get(`/investments/${user.userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setInvestments(response.data.investments);
      setError("");
    } catch (err) {
      setError("Error fetching investments. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleChangeView = (event, newValue) => {
    setViewMode(newValue);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "100vh",
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading your investment portfolio...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8f9fa", padding: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: "primary.main" }}>
            Investment Portfolio
          </Typography>
          <Tooltip title="Refresh data">
            <IconButton onClick={fetchInvestments} disabled={refreshing} color="primary">
              {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {error && (
          <Alert severity="error" sx={{ marginBottom: 3 }}>
            {error}
          </Alert>
        )}

        {investments.length === 0 ? (
          <Paper 
            elevation={3} 
            sx={{ 
              padding: 4, 
              textAlign: "center", 
              borderRadius: 2,
              backgroundColor: "white"
            }}
          >
            <Box sx={{ my: 4 }}>
              <TrendingUpIcon sx={{ fontSize: 80, color: "primary.light", opacity: 0.7 }} />
              <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>No investments found</Typography>
              <Typography variant="body1" color="text.secondary">
                Start investing by searching for stocks in the Stock Market section.
              </Typography>
              <Button 
                variant="contained" 
                sx={{ mt: 3 }}
                href="/stocks" // Assuming this route exists
              >
                Go to Stock Market
              </Button>
            </Box>
          </Paper>
        ) : (
          <>
            {/* Portfolio Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <Card elevation={2} sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Portfolio Value</Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                      ${portfolioStats.totalValue}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card elevation={2} sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Total Invested</Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                      ${portfolioStats.totalInvested}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card elevation={2} sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Total Return</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <Typography 
                        variant="h4" 
                        fontWeight="bold"
                        color={parseFloat(portfolioStats.totalReturn) >= 0 ? "success.main" : "error.main"}
                      >
                        ${portfolioStats.totalReturn}
                      </Typography>
                      {parseFloat(portfolioStats.totalReturn) >= 0 ? 
                        <TrendingUpIcon sx={{ ml: 1, color: "success.main" }} /> : 
                        <TrendingDownIcon sx={{ ml: 1, color: "error.main" }} />
                      }
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card elevation={2} sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Return Percentage</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <Typography 
                        variant="h4" 
                        fontWeight="bold"
                        color={parseFloat(portfolioStats.returnPercentage) >= 0 ? "success.main" : "error.main"}
                      >
                        {portfolioStats.returnPercentage}%
                      </Typography>
                      {parseFloat(portfolioStats.returnPercentage) >= 0 ? 
                        <TrendingUpIcon sx={{ ml: 1, color: "success.main" }} /> : 
                        <TrendingDownIcon sx={{ ml: 1, color: "error.main" }} />
                      }
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* View Controls */}
            <Paper sx={{ mb: 4, borderRadius: 2 }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs 
                  value={viewMode} 
                  onChange={handleChangeView} 
                  aria-label="investment view modes"
                  centered
                  variant={isMobile ? "scrollable" : "standard"}
                  scrollButtons={isMobile ? "auto" : false}
                >
                  <Tab 
                    label="Dashboard" 
                    value="dashboard" 
                    icon={<PieChartIcon />} 
                    iconPosition="start"
                  />
                  <Tab 
                    label="Performance" 
                    value="performance" 
                    icon={<ShowChartIcon />} 
                    iconPosition="start"
                  />
                  <Tab 
                    label="Details" 
                    value="details" 
                    icon={<TableViewIcon />} 
                    iconPosition="start"
                  />
                </Tabs>
              </Box>
              
              {viewMode === "performance" && (
                <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="time-range-label">Time Range</InputLabel>
                    <Select
                      labelId="time-range-label"
                      value={timeRange}
                      label="Time Range"
                      onChange={handleTimeRangeChange}
                    >
                      <MenuItem value="1W">1 Week</MenuItem>
                      <MenuItem value="1M">1 Month</MenuItem>
                      <MenuItem value="3M">3 Months</MenuItem>
                      <MenuItem value="1Y">1 Year</MenuItem>
                      <MenuItem value="ALL">All Time</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Paper>

            {/* Dashboard View */}
            {viewMode === "dashboard" && (
              <Grid container spacing={3}>
                {/* Portfolio Allocation Chart */}
                <Grid item xs={12} md={7}>
                  <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                    <Typography variant="h6" gutterBottom>
                      Portfolio Allocation
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    {/* Pie Chart with allocationData including color property */}
                    <Box sx={{ 
                      height: 300, 
                      display: "flex", 
                      justifyContent: "center", 
                      alignItems: "center",
                      flexDirection: "column"
                    }}>
                      <PieChartComponent data={allocationData} />
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Allocation Breakdown
                      </Typography>
                      <Grid container spacing={1}>
                        {allocationData.map((item) => (
                          <Grid item key={item.name}>
                            <Chip 
                              icon={
                                <Box 
                                  sx={{ 
                                    width: 12, 
                                    height: 12, 
                                    borderRadius: '50%', 
                                    bgcolor: item.color,
                                    ml: 0.5
                                  }}
                                />
                              }
                              label={`${item.name}: ${item.percentage}%`} 
                              variant="outlined" 
                              size="small"
                              sx={{ 
                                '& .MuiChip-icon': { 
                                  margin: 0, 
                                  marginLeft: '8px',
                                  marginRight: '-4px'
                                }
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Paper>
                </Grid>
                
                {/* Top Performers */}
                <Grid item xs={12} md={5}>
                  <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                    <Typography variant="h6" gutterBottom>
                      Performance Highlights
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="success.main" gutterBottom>
                        Best Performer
                      </Typography>
                      {portfolioStats.bestPerformer && portfolioStats.bestPerformer.stock_symbol ? (
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {portfolioStats.bestPerformer.company_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {portfolioStats.bestPerformer.stock_symbol}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                              <Typography variant="body1" fontWeight="bold" color="success.main">
                                +{portfolioStats.bestPerformer.performance.toFixed(2)}%
                              </Typography>
                              <Typography variant="caption">
                                ${portfolioStats.bestPerformer.current_price} / ${portfolioStats.bestPerformer.purchase_price}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No data available</Typography>
                      )}
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="error.main" gutterBottom>
                        Worst Performer
                      </Typography>
                      {portfolioStats.worstPerformer && portfolioStats.worstPerformer.stock_symbol ? (
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {portfolioStats.worstPerformer.company_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {portfolioStats.worstPerformer.stock_symbol}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                              <Typography variant="body1" fontWeight="bold" color="error.main">
                                {portfolioStats.worstPerformer.performance.toFixed(2)}%
                              </Typography>
                              <Typography variant="caption">
                                ${portfolioStats.worstPerformer.current_price} / ${portfolioStats.worstPerformer.purchase_price}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No data available</Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Performance View */}
            {viewMode === "performance" && (
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Portfolio Performance ({timeRange})
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {/* Line Chart Placeholder */}
                <Box sx={{ 
                  height: 400, 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center",
                  flexDirection: "column" 
                }}>
                  <PerformanceChartComponent 
                    timeRange={timeRange} 
                    investments={investments}
                  />
                </Box>
              </Paper>
            )}

            {/* Details View - Enhanced Table */}
            {viewMode === "details" && (
              <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow sx={{ 
                        backgroundColor: theme.palette.primary.main,
                        '& th': { color: '#fff' }
                      }}>
                        <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'inherit' }}>Stock</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'inherit' }}>Symbol</Typography></TableCell>
                        <TableCell align="right"><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'inherit' }}>Quantity</Typography></TableCell>
                        <TableCell align="right"><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'inherit' }}>Purchase Price</Typography></TableCell>
                        <TableCell align="right"><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'inherit' }}>Current Price</Typography></TableCell>
                        <TableCell align="right"><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'inherit' }}>Market Value</Typography></TableCell>
                        <TableCell align="right"><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'inherit' }}>Profit/Loss</Typography></TableCell>
                        <TableCell align="right"><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'inherit' }}>Change %</Typography></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {investments.map((investment, index) => {
                        const profitLoss = investment.profit_loss;
                        const profitLossPercentage = ((investment.current_price - investment.purchase_price) / investment.purchase_price * 100).toFixed(2);
                        const marketValue = (investment.current_price * investment.quantity).toFixed(2);
                        
                        return (
                          <TableRow 
                            key={investment.stock_symbol} 
                            hover
                            sx={{ 
                              backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'inherit',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                transition: 'background-color 0.2s ease'
                              }
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{investment.company_name}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={investment.stock_symbol} 
                                size="small" 
                                variant="filled"
                                sx={{ 
                                  backgroundColor: allocationData.find(item => item.name === investment.stock_symbol)?.color || '#888',
                                  color: '#fff',
                                  fontWeight: 'bold'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">{investment.quantity}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">${investment.purchase_price}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">${investment.current_price}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>${marketValue}</Typography>
                            </TableCell>
                            <TableCell 
                              align="right"
                            >
                              <Typography
                                variant="body2"
                                sx={{ 
                                  color: profitLoss >= 0 ? "success.main" : "error.main",
                                  fontWeight: "medium"
                                }}
                              >
                                ${profitLoss.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "flex-end"
                              }}>
                                {profitLoss >= 0 ? 
                                  <TrendingUpIcon fontSize="small" sx={{ mr: 0.5, color: "success.main" }} /> : 
                                  <TrendingDownIcon fontSize="small" sx={{ mr: 0.5, color: "error.main" }} />
                                }
                                <Typography
                                  variant="body2"
                                  sx={{ 
                                    color: profitLoss >= 0 ? "success.main" : "error.main",
                                    fontWeight: "medium"
                                  }}
                                >
                                  {profitLossPercentage}%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
                
                {/* Mobile-friendly responsive alternative view for very small screens */}
                {isMobile && (
                  <Box sx={{ display: { xs: 'block', sm: 'none' }, p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Scroll horizontally to view all data or rotate your device.
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

// Pie Chart Component - Now using colors from allocationData
const PieChartComponent = ({ data }) => {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300">
      <circle cx="150" cy="150" r="100" fill="#f0f0f0" />
      
      {/* Pie segments with colors from the data */}
      {data.map((item, index) => {
        // Create pie segments based on percentage
        const angle = (item.percentage / 100) * 360;
        const previousAngles = data
          .slice(0, index)
          .reduce((sum, d) => sum + (d.percentage / 100) * 360, 0);
        
        // Simple visualization for placeholder purposes
        const startAngle = previousAngles * (Math.PI / 180);
        const endAngle = (previousAngles + angle) * (Math.PI / 180);
        
        const x1 = 150 + 100 * Math.cos(startAngle);
        const y1 = 150 + 100 * Math.sin(startAngle);
        const x2 = 150 + 100 * Math.cos(endAngle);
        const y2 = 150 + 100 * Math.sin(endAngle);
        
        // For small angles use an arc, for large angles use a wedge
        const largeArcFlag = angle > 180 ? 1 : 0;
        
        const pathData = [
          `M 150 150`,
          `L ${x1} ${y1}`,
          `A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `Z`
        ].join(' ');
        
        return (
          <path
            key={item.name}
            d={pathData}
            fill={item.color}
            stroke="#fff"
            strokeWidth="1"
          />
        );
      })}
      
      {/* Center text */}
      <text x="150" y="150" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold">
        Portfolio
      </text>
    </svg>
  );
};

// Performance Chart Component
const PerformanceChartComponent = ({ timeRange, investments }) => {
  return (
    <svg width="700" height="300" viewBox="0 0 700 300">
      {/* X and Y axes */}
      <line x1="50" y1="250" x2="650" y2="250" stroke="#ccc" strokeWidth="1" />
      <line x1="50" y1="50" x2="50" y2="250" stroke="#ccc" strokeWidth="1" />
      
      {/* Generate a sample performance line */}
      {investments.length > 0 && (
        <path
          d={`M 50 200 Q 150 100, 250 180 T 450 150 T 650 80`}
          fill="none"
          stroke="#3f51b5"
          strokeWidth="3"
        />
      )}
      
      {/* X-axis labels */}
      {['', '1w', '1m', '3m', '6m', '1y'].map((label, i) => (
        <text 
          key={label} 
          x={50 + i * 120} 
          y="270" 
          textAnchor="middle" 
          fontSize="12" 
          fill="#666"
        >
          {label}
        </text>
      ))}
      
      {/* Y-axis labels */}
      {['-10%', '-5%', '0%', '+5%', '+10%'].map((label, i) => (
        <text 
          key={label} 
          x="40" 
          y={250 - i * 50} 
          textAnchor="end" 
          fontSize="12" 
          fill="#666"
        >
          {label}
        </text>
      ))}

      {/* Time range indicator */}
      <text x="650" y="30" textAnchor="end" fontSize="14" fontWeight="bold" fill="#3f51b5">
        {timeRange}
      </text>
    </svg>
  );
};

export default Investments;