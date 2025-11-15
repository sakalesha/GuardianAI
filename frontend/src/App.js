import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateAlert from "./pages/CreateAlert";
import AlertDetails from './pages/AlertDetails';
import MyAlerts from './pages/MyAlerts';
import EditAlert from './pages/EditAlert';
import Layout from './components/Layout'; // ⬅ NEW

export default function App() {
  return (
    <AuthProvider>
      <Router>

        {/* 🔔 Global Toast Container */}
        <Toaster position="top-right" />

        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>  {/* ⬅ Navbar added to ALL protected pages */}

              {/* User Dashboard */}
              <Route path="/user/dashboard" element={<Dashboard />} />

              {/* Admin Dashboard */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
              </Route>

              {/* Alerts CRUD */}
              <Route path="/create-alert" element={<CreateAlert />} />
              <Route path="/alerts/:id" element={<AlertDetails />} />
              <Route path="/my-alerts" element={<MyAlerts />} />
              <Route path="/alerts/edit/:id" element={<EditAlert />} />

            </Route>
          </Route>

          {/* Redirect Unknown Paths */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
