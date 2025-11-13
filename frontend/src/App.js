import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateAlert from "./pages/CreateAlert";
import AlertDetails from './pages/AlertDetails';
import MyAlerts from './pages/MyAlerts';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/user/dashboard" element={<Dashboard />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
            </Route>

            <Route path="/create-alert" element={<CreateAlert />} />
            <Route path="/alerts/:id" element={<AlertDetails />} />
            <Route path="/my-alerts" element={<MyAlerts />} />
          </Route>

          {/* Default Redirect */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function Protected({ children }) {
  const { token } = React.useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
}
