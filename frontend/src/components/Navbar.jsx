import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FiHome, FiPlusCircle, FiBell, FiUser, FiLogOut } from "react-icons/fi";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-navy/90 border-b border-border shadow-lg">
      {/* DESKTOP NAV */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Left: Logo */}
        <Link to="/user/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-panel border-electric border flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <FiHome className="text-electric" size={18} />
          </div>
          <span className="text-xl font-display font-bold text-textPrimary tracking-wide">GuardianAI</span>
        </Link>

        {/* Center: Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-textSecondary font-medium">

          <Link
            to="/user/dashboard"
            className={`flex items-center gap-2 transition-colors ${isActive('/user/dashboard') ? 'text-electric drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'hover:text-textPrimary'}`}
          >
            <FiHome size={18} /> Dashboard
          </Link>

          <Link
            to="/create-alert"
            className={`flex items-center gap-2 transition-colors ${isActive('/create-alert') ? 'text-electric drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'hover:text-textPrimary'}`}
          >
            <FiPlusCircle size={18} /> Post Alert
          </Link>

          <Link
            to="/my-alerts"
            className={`flex items-center gap-2 transition-colors ${isActive('/my-alerts') ? 'text-electric drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'hover:text-textPrimary'}`}
          >
            <FiBell size={18} /> My Alerts
          </Link>
        </div>

        {/* Right: User + Logout */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-panel border border-border rounded-lg">
              <FiUser size={16} className="text-electric" />
              <span className="text-textPrimary font-mono text-sm">{user.name}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-transparent text-rose border border-rose px-4 py-2 rounded-lg hover:bg-rose hover:text-white transition-all shadow-[0_0_8px_rgba(244,63,94,0.3)] hover:shadow-[0_0_15px_rgba(244,63,94,0.6)]"
          >
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* MOBILE NAV (Bottom Fixed in real app, but here just replacing what was there) */}
      <div className="md:hidden border-t border-border bg-panel backdrop-blur-lg flex justify-around py-3">

        <Link
          to="/user/dashboard"
          className={`flex flex-col items-center transition-colors ${isActive('/user/dashboard') ? 'text-electric scale-110 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]' : 'text-textSecondary hover:text-textPrimary'}`}
        >
          <FiHome size={22} />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link
          to="/create-alert"
          className={`flex flex-col items-center transition-colors ${isActive('/create-alert') ? 'text-electric scale-110 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]' : 'text-textSecondary hover:text-textPrimary'}`}
        >
          <FiPlusCircle size={22} />
          <span className="text-xs mt-1">Post</span>
        </Link>

        <Link
          to="/my-alerts"
          className={`flex flex-col items-center transition-colors ${isActive('/my-alerts') ? 'text-electric scale-110 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]' : 'text-textSecondary hover:text-textPrimary'}`}
        >
          <FiBell size={22} />
          <span className="text-xs mt-1">My Alerts</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-rose hover:text-white transition-colors"
        >
          <FiLogOut size={22} />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </div>
    </nav>
  );
}
