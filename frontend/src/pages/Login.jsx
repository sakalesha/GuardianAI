import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FiShield } from "react-icons/fi";

const LoginPage = () => {
  const { setUser, setToken } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // handle form input changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://guardianai-crp4.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid credentials.");

      // save token + user
      setToken(data.token);
      setUser(data.user);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // redirect based on role
      const route =
        data.user.role === "admin"
          ? "/admin/dashboard"
          : "/user/dashboard";

      navigate(route, { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong, try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-midnight text-textSecondary">
      
      {/* LEFT PANEL - Brand Story */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-gradient-to-br from-[#0A1628] to-[#0F1E40] p-16 relative overflow-hidden text-textPrimary">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
        
        <div className="z-10 max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-panel border-electric border flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] mb-8">
            <FiShield className="text-electric" size={32} />
          </div>
          
          <h1 className="text-5xl font-display font-bold mb-4 tracking-tight">Your Community.<br/><span className="text-electric">Your Safety.</span></h1>
          <p className="text-lg text-textSecondary mb-8 leading-relaxed">
            Join the most advanced civic-tech platform designed to monitor, report, and resolve safety incidents in real time.
          </p>

          <ul className="space-y-4">
            {[
              "Real-time incident reporting with photo evidence",
              "Interactive geospatial incident map",
              "AI-powered severity classification",
              "Personal dashboard to manage your reports"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-textPrimary font-medium">
                <span className="text-electric">✦</span> {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT PANEL - Auth Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8 sm:p-16 lg:px-24 bg-midnight">
        <div className="w-full max-w-sm mx-auto">
          
          <div className="lg:hidden w-12 h-12 rounded-xl bg-panel border-electric border flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)] mb-8 mx-auto">
            <FiShield className="text-electric" size={24} />
          </div>

          <h2 className="text-3xl font-display font-bold text-textPrimary mb-2 lg:text-left text-center">
            Welcome back
          </h2>
          <p className="text-textSecondary mb-8 lg:text-left text-center">
            Sign in to your GuardianAI account
          </p>

          {error && (
            <div className="bg-rose/10 border border-rose/30 text-rose px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 shadow-[0_4px_10px_rgba(244,63,94,0.1)]">
              ⚠️ <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-textSecondary text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-textSecondary text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-12"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-textSecondary hover:text-textPrimary transition"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 mt-4 text-sm uppercase tracking-wider font-bold"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 text-sm text-textMuted font-mono">or continue with</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          <p className="text-center text-textSecondary text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-electric hover:text-blue-400 font-medium transition drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]">
              Create one
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default LoginPage;
