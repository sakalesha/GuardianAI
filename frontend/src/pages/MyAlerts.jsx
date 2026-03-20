import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { FiTrash2, FiEye, FiArchive } from "react-icons/fi";

const API_BASE = "https://guardianai-crp4.onrender.com";

const MyAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMyAlerts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/alerts/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlerts(res.data);
      } catch (err) {
        toast.error("Unable to load your alerts", {
           style: { background: '#0F1628', color: '#F43F5E', border: '1px solid #1E2D50' }
        });
      } finally {
        setLoading(false);
      }
    };
    loadMyAlerts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Initialize complete purge of this record?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts((prev) => prev.filter((alert) => alert._id !== id));
      toast.success("Alert purged successfully", {
        style: { background: '#0F1628', color: '#10B981', border: '1px solid #1E2D50' }
      });
    } catch (err) {
      toast.error("System failure: Unable to delete alert", {
         style: { background: '#0F1628', color: '#F43F5E', border: '1px solid #1E2D50' }
      });
    }
  };

  if (loading) return <Loader text="Accessing Local Telemetry..." />;

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4 pb-12">
      <div className="flex items-center gap-4 mb-8">
         <div className="w-12 h-12 rounded-xl bg-panel border-electric border flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <FiArchive className="text-electric" size={24} />
         </div>
         <h1 className="text-4xl font-display font-bold text-textPrimary tracking-tight">
            My Incident Logs
         </h1>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center mt-12 bg-panel/30 border border-border/50 rounded-2xl p-6 shadow-lg">
          <svg className="w-20 h-20 text-electric/30 mb-6 drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <h3 className="text-xl text-textPrimary font-bold mb-2 tracking-wide font-display">No Telemetry Recorded</h3>
          <p className="text-textMuted mb-6 max-w-md">You haven't initialized any incident reports under this operator ID.</p>
          <button onClick={() => navigate('/create-alert')} className="btn-primary flex items-center gap-2">
             Compile First Report
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {alerts.map((alert) => (
            <div key={alert._id} className="card p-5 group flex flex-col h-full bg-panel hover:bg-navy/80 ring-1 ring-border/50 hover:ring-electric/50">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] px-2 py-0.5 uppercase tracking-wider rounded font-bold border
                     ${alert.severity === "High" ? "border-rose text-rose bg-rose/10" : 
                       alert.severity === "Medium" ? "border-amber text-amber bg-amber/10" : 
                       "border-emerald text-emerald bg-emerald/10"}`}>
                  {alert.severity || "Unknown"}
                </span>
                <span className="text-[10px] font-mono text-textMuted text-right">
                  {new Date(alert.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Media */}
              {alert.mediaUrl && (
                <div className="mb-4 -mx-1 border border-border/50 rounded-lg overflow-hidden h-36">
                  <img
                    src={alert.mediaUrl.startsWith("http") || alert.mediaUrl.startsWith("data:") ? alert.mediaUrl : `${API_BASE}${alert.mediaUrl}`}
                    alt="alert visual"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-grow">
                 <h2 className="text-xl font-display font-bold text-textPrimary leading-tight mb-2 group-hover:text-electric transition-colors line-clamp-2">
                   {alert.title}
                 </h2>
                 <p className="text-sm text-textSecondary line-clamp-3 mb-6 font-sans">
                   {alert.description}
                 </p>
               </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border">
                <button
                  onClick={() => navigate(`/alerts/${alert._id}`)}
                  className="flex-1 btn-outline bg-transparent border-electric/30 text-electric hover:bg-electric hover:text-white hover:border-electric flex justify-center items-center gap-2 py-2 text-xs font-bold uppercase tracking-widest"
                >
                  <FiEye size={14} /> Review
                </button>
                <button
                  onClick={() => handleDelete(alert._id)}
                  className="px-3 py-2 bg-rose/10 border border-rose/30 text-rose hover:bg-rose hover:text-white hover:border-rose rounded-lg transition-all shadow-none flex justify-center items-center"
                  title="Purge Report"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAlerts;
