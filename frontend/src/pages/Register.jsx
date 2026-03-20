import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiShield } from "react-icons/fi";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    role: "resident",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // handle form changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword)
      return setError("Passwords do not match");

    try {
      setLoading(true);

      const response = await fetch(
        "https://guardianai-crp4.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json"))
        throw new Error("Unexpected server response.");

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      // persist data (optional: auto-login)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // redirect to dashboard (resident default)
      navigate("/user/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong");
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
          
          <h1 className="text-5xl font-display font-bold mb-4 tracking-tight">Protecting Urban<br/><span className="text-electric">Spaces & lives.</span></h1>
          <p className="text-lg text-textSecondary mb-8 leading-relaxed">
            Report infrastructure hazards and critical emergencies. Empower municipal intelligence and ensure neighborhood safety.
          </p>

          <ul className="space-y-4">
            {[
              "Contribute to local safety heatmaps",
              "Receive alerts about nearby anomalies",
              "Verified trust system for community reports",
              "End-to-end encrypted incident telemetry"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-textPrimary font-medium">
                <span className="text-electric">✦</span> {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT PANEL - Auth Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8 sm:p-12 lg:px-24 bg-midnight">
        <div className="w-full max-w-md mx-auto">
          
          <div className="lg:hidden w-12 h-12 rounded-xl bg-panel border-electric border flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)] mb-8 mx-auto">
            <FiShield className="text-electric" size={24} />
          </div>

          <h2 className="text-3xl font-display font-bold text-textPrimary mb-2 lg:text-left text-center">
            Create System Uplink
          </h2>
          <p className="text-textSecondary mb-8 lg:text-left text-center">
            Register your GuardianAI resident account
          </p>

          {error && (
            <div className="bg-rose/10 border border-rose/30 text-rose px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 shadow-[0_4px_10px_rgba(244,63,94,0.1)]">
              ⚠️ <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name & Location row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-textSecondary text-sm font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-textSecondary text-sm font-semibold mb-1">Location Zone</label>
                <select
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="" className="text-textMuted">Select city...</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-textSecondary text-sm font-semibold mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="name@domain.com"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-textSecondary text-sm font-semibold mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-textSecondary text-sm font-semibold mb-1">Confirm Identity</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 mt-6 text-sm uppercase tracking-wider font-bold"
            >
              {loading ? "Establishing Link..." : "Create Account"}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-border"></div>
          </div>

          <p className="text-center text-textSecondary text-sm">
            Already registered?{" "}
            <Link to="/login" className="text-electric hover:text-blue-400 font-medium transition drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]">
              Sign in to array
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default RegisterPage;
