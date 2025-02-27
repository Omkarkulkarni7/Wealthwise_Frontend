import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./components/Home";
import BankAccount from "./components/BankAccount";
import Pay from "./components/Pay";
import Stocks from "./components/Stocks";
import Investments from "./components/Investments";
import Welcome from "./pages/Welcome"; // Import the new Welcome component

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Welcome />} /> {/* Route for the Welcome page */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />}>
                        <Route path="home" element={<Home />} />
                        <Route path="bank-account" element={<BankAccount />} />
                        <Route path="pay" element={<Pay />} />
                        <Route path="stocks" element={<Stocks />} />
                        <Route path="investments" element={<Investments />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;