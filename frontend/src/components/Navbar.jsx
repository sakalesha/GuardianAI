import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FiHome, FiPlusCircle, FiBell, FiUser, FiLogOut } from "react-icons/fi";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200 shadow-md">
      {/* DESKTOP NAV */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Left: Logo */}
        <Link to="/user/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600">GuardianAI</span>
        </Link>

        {/* Center: Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-gray-700 font-medium">

          <Link
            to="/user/dashboard"
            className="flex items-center gap-2 hover:text-blue-600 transition"
          >
            <FiHome size={18} /> Dashboard
          </Link>

          <Link
            to="/create-alert"
            className="flex items-center gap-2 hover:text-blue-600 transition"
          >
            <FiPlusCircle size={18} /> Post Alert
          </Link>

          <Link
            to="/my-alerts"
            className="flex items-center gap-2 hover:text-blue-600 transition"
          >
            <FiBell size={18} /> My Alerts
          </Link>
        </div>

        {/* Right: User + Logout */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:flex items-center gap-2">
              <FiUser size={20} className="text-gray-600" />
              <span className="text-gray-700 font-medium">{user.name}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
          >
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* MOBILE NAV */}
      <div className="md:hidden border-t bg-white/90 backdrop-blur-lg shadow-inner flex justify-around py-3">

        <Link
          to="/user/dashboard"
          className="flex flex-col items-center text-gray-600 hover:text-blue-600"
        >
          <FiHome size={22} />
          <span className="text-xs">Home</span>
        </Link>

        <Link
          to="/create-alert"
          className="flex flex-col items-center text-gray-600 hover:text-blue-600"
        >
          <FiPlusCircle size={22} />
          <span className="text-xs">Post</span>
        </Link>

        <Link
          to="/my-alerts"
          className="flex flex-col items-center text-gray-600 hover:text-blue-600"
        >
          <FiBell size={22} />
          <span className="text-xs">My Alerts</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-red-500 hover:text-red-600"
        >
          <FiLogOut size={22} />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </nav>
  );
}
