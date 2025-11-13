import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ Correct import for v4+

const PrivateRoute = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp && decoded.exp < currentTime) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    return <Outlet />;
  } catch {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;
