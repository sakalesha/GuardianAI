import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Shield, LogIn, UserPlus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CITIZEN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_0%,transparent_50%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full glass p-12 rounded-[3rem] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] text-center space-y-8 relative z-10"
      >
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-primary/20 rounded-[2rem] flex items-center justify-center border border-primary/50 shadow-[0_0_30px_rgba(0,240,255,0.4)] rotate-3 hover:rotate-0 transition-transform duration-500">
            <Shield className="text-primary" size={48} strokeWidth={2.5} />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            CivicProof
          </h1>
          <p className="text-secondary font-bold uppercase tracking-widest text-xs leading-relaxed">
            Holding authorities accountable through visual proof.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-black/50 border border-white/5 rounded-2xl p-1 gap-1">
          {["login", "register"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                tab === t
                  ? "bg-primary text-black shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                  : "text-secondary hover:text-white"
              }`}
            >
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <AnimatePresence mode="wait">
            {tab === "register" && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-5 py-4 rounded-xl border border-white/10 bg-black/30 text-white text-xs font-bold tracking-widest placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-white/10 bg-black/30 text-white text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="CITIZEN">Role: Citizen</option>
                  <option value="WORKER">Role: Worker / Laborer</option>
                  <option value="AUTHORITY">Role: Authority Official</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-5 py-4 rounded-xl border border-white/10 bg-black/30 text-white text-xs font-bold tracking-widest placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-5 py-4 rounded-xl border border-white/10 bg-black/30 text-white text-xs font-bold tracking-widest placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] text-red-500 font-black uppercase tracking-widest text-center bg-red-50 py-3 px-4 rounded-xl border border-red-100"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-black py-5 rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:scale-100"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : tab === "login" ? (
              <>
                <LogIn size={16} />
                Sign In
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Create Account
              </>
            )}
          </button>
        </form>

        {tab === "login" && (
          <div className="pt-6 border-t border-white/10 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary text-center">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={async () => {
                  setError("");
                  setLoading(true);
                  try { await login("citizen@demo.com", "password123"); }
                  catch (err) { setError(err.message); }
                  finally { setLoading(false); }
                }}
                className="py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-primary/50 hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={async () => {
                  setError("");
                  setLoading(true);
                  try { await login("worker@demo.com", "password123"); }
                  catch (err) { setError(err.message); }
                  finally { setLoading(false); }
                }}
                className="py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-success/50 hover:shadow-[0_0_10px_rgba(0,255,136,0.3)] transition-all"
              >
                Worker
              </button>
              <button
                type="button"
                onClick={async () => {
                  setError("");
                  setLoading(true);
                  try { await login("authority@demo.com", "password123"); }
                  catch (err) { setError(err.message); }
                  finally { setLoading(false); }
                }}
                className="py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-danger/50 hover:shadow-[0_0_10px_rgba(255,0,85,0.3)] transition-all"
              >
                Authority
              </button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest opacity-60">
          Secure Civic Accountability Layer v3.0
        </p>
      </motion.div>
    </div>
  );
}
