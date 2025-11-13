// src/utils/axiosInstance.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// ✅ Base Axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // Change if needed
  headers: { "Content-Type": "application/json" },
});

// ✅ Request interceptor: attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      // Optional: check if token expired before sending
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          console.warn("Token expired — logging out...");
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          window.location.href = "/login";
          return Promise.reject(new Error("Token expired"));
        }
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor: auto logout on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized — logging out...");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
