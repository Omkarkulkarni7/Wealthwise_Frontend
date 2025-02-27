import React, { useEffect, useState } from "react";
import { 
  Typography, 
  Container, 
  Box, 
  Paper, 
  Button, 
  CircularProgress, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  Card,
  CardContent,
  Grid,
  Alert,
  InputAdornment,
  Snackbar,
  IconButton,
  Chip,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import { 
  AccountBalanceWallet, 
  ArrowUpward, 
  ArrowDownward, 
  DeleteOutline, 
  Close,
  CreditCard,
  AttachMoney
} from "@mui/icons-material";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";

const BankAccount = () => {
    const { user } = useAuth();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [balance, setBalance] = useState("");
    const [currency, setCurrency] = useState("INR");
    const [depositAmount, setDepositAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [openDepositDialog, setOpenDepositDialog] = useState(false);
    const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
    const [errors, setErrors] = useState({});

    const currencies = [
        { value: "INR", label: "Indian Rupee (₹)" },
        { value: "USD", label: "US Dollar ($)" },
        { value: "EUR", label: "Euro (€)" },
        { value: "GBP", label: "British Pound (£)" }
    ];

    const currencySymbols = {
        INR: "₹",
        USD: "$",
        EUR: "€",
        GBP: "£"
    };

    useEffect(() => {
        const fetchBankAccount = async () => {
            if (user) {
                const accessToken = localStorage.getItem("accessToken");
                try {
                    const response = await API.get(`/bank-accounts/${user.userId}`, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    setAccount(response.data);
                } catch (err) {
                    console.error("Error fetching account:", err);
                }
                setLoading(false);
            }
        };
        fetchBankAccount();
    }, [user]);

    const validateAmount = (amount, field) => {
        const errors = {};
        if (!amount) {
            errors[field] = "Amount is required";
        } else if (isNaN(amount) || parseFloat(amount) <= 0) {
            errors[field] = "Please enter a valid positive amount";
        }
        return errors;
    };

    const handleCreateAccount = async () => {
        const validationErrors = validateAmount(balance, "balance");
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setCreating(true);
        setErrors({});
        const accessToken = localStorage.getItem("accessToken");
        try {
            const response = await API.post(
                "/bank-accounts/create",
                { user_id: user.userId, balance, currency },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            setAccount(response.data.account);
            showNotification("Account created successfully", "success");
        } catch (err) {
            console.error("Error creating account:", err);
            showNotification("Failed to create account", "error");
        }
        setCreating(false);
    };

    const handleDeleteAccount = async () => {
        const accessToken = localStorage.getItem("accessToken");
        try {
            await API.delete(`/bank-accounts/${user.userId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setAccount(null);
            setOpenDeleteDialog(false);
            showNotification("Account deleted successfully", "success");
        } catch (err) {
            console.error("Error deleting account:", err);
            showNotification("Failed to delete account", "error");
        }
    };

    const handleDeposit = async () => {
        const validationErrors = validateAmount(depositAmount, "depositAmount");
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        const accessToken = localStorage.getItem("accessToken");
        try {
            const response = await API.put(
                "/transactions/deposit",
                { bankAccountId: account.id, amount: depositAmount },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            setAccount({ ...account, balance: response.data.newBalance });
            setOpenDepositDialog(false);
            setDepositAmount("");
            showNotification(`Successfully deposited ${currencySymbols[account.currency]}${depositAmount}`, "success");
        } catch (err) {
            console.error("Error depositing:", err);
            showNotification("Failed to deposit amount", "error");
        }
    };

    const handleWithdraw = async () => {
        const validationErrors = validateAmount(withdrawAmount, "withdrawAmount");
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (parseFloat(withdrawAmount) > parseFloat(account.balance)) {
            setErrors({ withdrawAmount: "Insufficient balance" });
            return;
        }

        setErrors({});
        const accessToken = localStorage.getItem("accessToken");
        try {
            const response = await API.put(
                "/transactions/withdraw",
                { bankAccountId: account.id, amount: withdrawAmount },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            setAccount({ ...account, balance: response.data.newBalance });
            setOpenWithdrawDialog(false);
            setWithdrawAmount("");
            showNotification(`Successfully withdrew ${currencySymbols[account.currency]}${withdrawAmount}`, "success");
        } catch (err) {
            console.error("Error withdrawing:", err);
            showNotification("Failed to withdraw amount", "error");
        }
    };

    const showNotification = (message, severity) => {
        setNotification({ open: true, message, severity });
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 100px)" }}>
                <CircularProgress size={60} thickness={4} color="primary" />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {!account ? (
                <Card elevation={4} sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <Box sx={{ bgcolor: "primary.main", color: "white", p: 3 }}>
                        <Typography variant="h5" fontWeight="bold">
                            Create a Bank Account
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                            Start your banking journey by setting up a new account
                        </Typography>
                    </Box>
                    <CardContent sx={{ p: 4 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Initial Balance"
                                    variant="outlined"
                                    fullWidth
                                    type="number"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AttachMoney />
                                            </InputAdornment>
                                        ),
                                    }}
                                    error={!!errors.balance}
                                    helperText={errors.balance}
                                    value={balance}
                                    onChange={(e) => setBalance(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="currency-select-label">Currency</InputLabel>
                                    <Select
                                        labelId="currency-select-label"
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        label="Currency"
                                    >
                                        {currencies.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    onClick={handleCreateAccount}
                                    disabled={creating}
                                    startIcon={<AccountBalanceWallet />}
                                    sx={{ 
                                        py: 1.5, 
                                        borderRadius: 2,
                                        textTransform: "none",
                                        fontSize: "1rem"
                                    }}
                                >
                                    {creating ? "Creating Account..." : "Create Account"}
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            ) : (
                <Box>
                    <Card 
                        elevation={4} 
                        sx={{ 
                            borderRadius: 2, 
                            overflow: "hidden",
                            background: "linear-gradient(145deg, #2196f3 0%, #1976d2 100%)",
                            color: "white",
                            mb: 3
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box>
                                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                        Account Balance
                                    </Typography>
                                    <Typography variant="h3" fontWeight="bold" sx={{ my: 2 }}>
                                        {currencySymbols[account.currency]}{parseFloat(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Typography>
                                    <Chip 
                                        icon={<CreditCard sx={{ color: "white !important" }} />} 
                                        label={account.account_number} 
                                        sx={{ 
                                            bgcolor: "rgba(255,255,255,0.2)", 
                                            color: "white",
                                            "& .MuiChip-icon": { color: "white" } 
                                        }} 
                                    />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Button
                                variant="contained"
                                color="success"
                                fullWidth
                                size="large"
                                onClick={() => setOpenDepositDialog(true)}
                                startIcon={<ArrowUpward />}
                                sx={{ 
                                    py: 2, 
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontSize: "1rem",
                                    bgcolor: "#43a047",
                                    "&:hover": { bgcolor: "#2e7d32" }
                                }}
                            >
                                Deposit Funds
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button
                                variant="contained"
                                color="warning"
                                fullWidth
                                size="large"
                                onClick={() => setOpenWithdrawDialog(true)}
                                startIcon={<ArrowDownward />}
                                sx={{ 
                                    py: 2, 
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontSize: "1rem",
                                    bgcolor: "#ff9800",
                                    "&:hover": { bgcolor: "#f57c00" }
                                }}
                            >
                                Withdraw Funds
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => setOpenDeleteDialog(true)}
                                startIcon={<DeleteOutline />}
                                sx={{ 
                                    borderRadius: 2,
                                    textTransform: "none",
                                    borderWidth: 2,
                                    "&:hover": { borderWidth: 2 }
                                }}
                            >
                                Close Account
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Deposit Dialog */}
            <Dialog 
                open={openDepositDialog} 
                onClose={() => setOpenDepositDialog(false)}
                PaperProps={{ sx: { borderRadius: 2 } }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: "success.main", color: "white" }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">Deposit Funds</Typography>
                        <IconButton 
                            size="small" 
                            onClick={() => setOpenDepositDialog(false)}
                            sx={{ color: "white" }}
                        >
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 1, px: 3, mt: 1 }}>
                    <TextField
                        label="Amount to Deposit"
                        variant="outlined"
                        fullWidth
                        type="number"
                        autoFocus
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    {account && currencySymbols[account.currency]}
                                </InputAdornment>
                            ),
                        }}
                        error={!!errors.depositAmount}
                        helperText={errors.depositAmount}
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button 
                        onClick={() => setOpenDepositDialog(false)} 
                        sx={{ textTransform: "none" }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeposit} 
                        variant="contained" 
                        color="success"
                        sx={{ textTransform: "none", px: 3 }}
                    >
                        Deposit
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Withdraw Dialog */}
            <Dialog 
                open={openWithdrawDialog} 
                onClose={() => setOpenWithdrawDialog(false)}
                PaperProps={{ sx: { borderRadius: 2 } }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: "warning.main", color: "white" }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">Withdraw Funds</Typography>
                        <IconButton 
                            size="small" 
                            onClick={() => setOpenWithdrawDialog(false)}
                            sx={{ color: "white" }}
                        >
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 1, px: 3, mt: 1 }}>
                    {account && (
                        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                            Available Balance: {currencySymbols[account.currency]}{parseFloat(account.balance).toLocaleString()}
                        </Typography>
                    )}
                    <TextField
                        label="Amount to Withdraw"
                        variant="outlined"
                        fullWidth
                        type="number"
                        autoFocus
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    {account && currencySymbols[account.currency]}
                                </InputAdornment>
                            ),
                        }}
                        error={!!errors.withdrawAmount}
                        helperText={errors.withdrawAmount}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button 
                        onClick={() => setOpenWithdrawDialog(false)} 
                        sx={{ textTransform: "none" }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleWithdraw} 
                        variant="contained" 
                        color="warning"
                        sx={{ textTransform: "none", px: 3 }}
                    >
                        Withdraw
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Account Dialog */}
            <Dialog 
                open={openDeleteDialog} 
                onClose={() => setOpenDeleteDialog(false)}
                PaperProps={{ sx: { borderRadius: 2 } }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: "error.main", color: "white" }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">Close Account</Typography>
                        <IconButton 
                            size="small" 
                            onClick={() => setOpenDeleteDialog(false)}
                            sx={{ color: "white" }}
                        >
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 1, px: 3, mt: 1 }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This action cannot be undone. All account data will be permanently deleted.
                    </Alert>
                    {account && account.balance > 0 && (
                        <Alert severity="error">
                            Your account still has {currencySymbols[account.currency]}{parseFloat(account.balance).toLocaleString()} balance. Please withdraw all funds before closing.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button 
                        onClick={() => setOpenDeleteDialog(false)} 
                        sx={{ textTransform: "none" }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteAccount} 
                        variant="contained" 
                        color="error"
                        disabled={account && account.balance > 0}
                        sx={{ textTransform: "none", px: 3 }}
                    >
                        Close Account
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={5000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert 
                    onClose={handleCloseNotification} 
                    severity={notification.severity} 
                    sx={{ width: "100%" }}
                    variant="filled"
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default BankAccount;