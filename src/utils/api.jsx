import axios from "axios";

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000', // Change this to match your backend URL
    headers: {
        "Content-Type": "application/json",
    },
});

export default API;
