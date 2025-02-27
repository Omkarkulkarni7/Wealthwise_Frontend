import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const LogoutButton = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    
    const handleLogout = () => {
        logout(); // This already removes the token and clears the user state
        navigate("/login");
    };
    
    return <Button color="secondary" onClick={handleLogout}>Logout</Button>;
};

export default LogoutButton;