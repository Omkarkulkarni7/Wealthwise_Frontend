import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Show a loading indicator while fetching user data
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <div style={{ display: "flex" }}>
            <Sidebar  />
            <main style={{ flexGrow: 1, padding: "20px" }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Dashboard;