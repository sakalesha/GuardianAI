import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { FiArrowLeft, FiEdit2, FiTrash2, FiClock, FiMapPin, FiUser, FiActivity } from "react-icons/fi";

const API = "https://guardianai-crp4.onrender.com";

const AlertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Alert purged from system successfully", {
        style: { background: '#0F1628', color: '#10B981', border: '1px solid #1E2D50' }
      });
      navigate("/my-alerts");
    } catch (err) {
      console.error("Error deleting alert:", err);
      toast.error("System failure: Unable to delete alert", {
         style: { background: '#0F1628', color: '#F43F5E', border: '1px solid #1E2D50' }
      });
    } finally {
      setShowConfirm(false);
    }
  };

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/alerts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlert(res.data);
      } catch (err) {
        console.error("Error fetching alert:", err);
        toast.error("Unable to load securely encrypted alert details", {
           style: { background: '#0F1628', color: '#F43F5E', border: '1px solid #1E2D50' }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAlert();
  }, [id]);

  if (loading) return <Loader text="Decrypting Alert Telemetry..." />;

  if (!alert)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center text-rose">
        <FiActivity size={48} className="mb-4 opacity-50" />
        <h2 className="text-2xl font-mono uppercase tracking-widest">404: Telemetry Lost</h2>
        <p className="text-textMuted mt-2">The requested incident report could not be located in the array.</p>
        <button onClick={() => navigate(-1)} className="btn-outline mt-6">Return to Base</button>
      </div>
    );

  const postedTime = alert.createdAt ? new Date(alert.createdAt).toLocaleString() : "Unknown";
  
  // Calculate AI Confidence Badge attributes
  const aiScore = alert.aiConfidence ? alert.aiConfidence * 100 : 85; 
  let aiColorClass = "text-emerald border-emerald bg-emerald/10 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
  if (aiScore < 80 && aiScore >= 60) aiColorClass = "text-amber border-amber bg-amber/10 shadow-[0_0_8px_rgba(245,158,11,0.3)]";
  if (aiScore < 60) aiColorClass = "text-rose border-rose bg-rose/10 shadow-[0_0_8px_rgba(244,63,94,0.3)]";

  return (
    <div className="max-w-4xl mx-auto mt-6 mb-12">
      
      {/* Sticky Action Header */}
      <div className="sticky top-[64px] z-40 bg-navy/90 backdrop-blur-md border border-border mt-0 lg:mt-6 rounded-b-none lg:rounded-t-2xl px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
         
         <div className="flex items-center gap-4">
            <button
               onClick={() => navigate(-1)}
               className="p-2 border border-border rounded-lg hover:bg-panel hover:text-white text-textMuted transition"
            >
               <FiArrowLeft size={20} />
            </button>
            <div className="flex flex-wrap gap-2">
               <span className={`px-3 py-1 text-xs uppercase tracking-widest font-bold border rounded-md
                 ${alert.severity === "High" ? "border-rose text-rose bg-rose/10" : ""}
                 ${alert.severity === "Medium" ? "border-amber text-amber bg-amber/10" : ""}
                 ${alert.severity === "Low" ? "border-emerald text-emerald bg-emerald/10" : ""}
                 ${!alert.severity ? "border-border text-textMuted" : ""}
               `}>
                 {alert.severity || "Unknown"}
               </span>
               <span className={`px-3 py-1 text-xs uppercase tracking-widest font-bold border rounded-md ${aiColorClass} flex items-center gap-2`}>
                 <FiActivity /> AI CONF: {aiScore.toFixed(0)}%
               </span>
               <span className="px-3 py-1 text-xs uppercase tracking-widest font-bold border border-electric text-electric bg-electric/10 rounded-md">
                 {alert.category || "Hazard"}
               </span>
            </div>
         </div>

         {/* Owner Actions */}
         <div className="flex gap-3 w-full md:w-auto">
            <button
               onClick={() => navigate(`/alerts/edit/${alert._id}`)}
               className="flex-1 md:flex-none flex justify-center items-center gap-2 px-5 py-2 bg-panel border border-border text-textPrimary rounded-lg shadow hover:bg-navy transition"
            >
               <FiEdit2 size={16} /> Edit
            </button>

            <button
               onClick={() => setShowConfirm(true)}
               className="flex-1 md:flex-none flex justify-center items-center gap-2 px-5 py-2 bg-rose/10 border border-rose text-rose rounded-lg shadow hover:bg-rose hover:text-white transition shadow-[0_0_10px_rgba(244,63,94,0.2)]"
            >
               <FiTrash2 size={16} /> Delete
            </button>
         </div>
      </div>

      {/* Main Content Body */}
      <div className="bg-panel border border-t-0 border-border rounded-b-2xl p-6 md:p-10 shadow-lg">
         
         <h1 className="text-3xl md:text-5xl font-display font-bold text-textPrimary leading-tight mb-8">
            {alert.title}
         </h1>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 bg-midnight border border-border rounded-xl p-4">
            <div className="flex items-start gap-3">
               <FiClock className="text-electric mt-0.5" />
               <div>
                  <div className="text-[10px] text-textMuted uppercase tracking-widest">Detection Time</div>
                  <div className="text-sm font-mono text-textPrimary">{postedTime}</div>
               </div>
            </div>
            <div className="flex items-start gap-3">
               <FiMapPin className="text-rose mt-0.5" />
               <div>
                  <div className="text-[10px] text-textMuted uppercase tracking-widest">Location Vector</div>
                  <div className="text-sm font-mono text-textPrimary">{alert.location || "N/A"}</div>
               </div>
            </div>
            <div className="flex items-start gap-3">
               <FiUser className="text-emerald mt-0.5" />
               <div>
                  <div className="text-[10px] text-textMuted uppercase tracking-widest">Reported By</div>
                  <div className="text-sm text-textPrimary">{/* backend doesn't populate user easily in this model unless aggregated, fallback */} Community Resident</div>
               </div>
            </div>
            <div className="flex items-start gap-3">
               <div className="text-electric mt-0.5 w-4 h-4 border border-current rounded-[4px] flex items-center justify-center text-[8px] font-bold">XY</div>
               <div>
                  <div className="text-[10px] text-textMuted uppercase tracking-widest">Coordinates</div>
                  <div className="text-sm font-mono text-electric">{alert.latitude?.toFixed(4) || "0.0000"}, {alert.longitude?.toFixed(4) || "0.0000"}</div>
               </div>
            </div>
         </div>

         {alert.mediaUrl && (
            <div className="mb-8 border border-border rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
               <div className="bg-midnight px-4 py-2 border-b border-border flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose animate-pulse"></div>
                  <span className="text-xs font-mono text-textMuted uppercase tracking-widest">Visual Evidence Array</span>
               </div>
               <img
                  src={alert.mediaUrl.startsWith("http") || alert.mediaUrl.startsWith("data:") ? alert.mediaUrl : `${API}${alert.mediaUrl}`}
                  alt="Incident Visual Evidence"
                  className="w-full h-auto max-h-[500px] object-cover"
                  onError={(e) => { e.target.parentElement.style.display = 'none'; }}
               />
            </div>
         )}

         <div className="bg-midnight border border-border rounded-xl p-6 md:p-8">
            <div className="text-[10px] text-electric uppercase tracking-widest mb-4 font-mono">Incident Dispatch Description</div>
            <p className="text-textSecondary text-lg leading-relaxed font-sans">
               {alert.description}
            </p>
         </div>

      </div>

      {/* Delete Confirmation Modal (Dark Theme) */}
      {showConfirm && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-panel border border-border rounded-2xl p-8 max-w-md w-full shadow-[0_0_40px_rgba(244,63,94,0.15)] transform translate-y-0 opacity-100 transition-all">
               <div className="w-16 h-16 rounded-2xl bg-rose/10 border border-rose/30 flex items-center justify-center mx-auto mb-6">
                  <FiTrash2 className="text-rose" size={32} />
               </div>
               <h3 className="text-2xl font-display font-bold text-center text-textPrimary mb-2">Initiate Purge Protocol?</h3>
               <p className="text-center text-textSecondary mb-8">
                  Are you absolutely certain you want to delete this incident report? This action will permanently remove the telemetry from the GuardianAI network.
               </p>
               <div className="flex gap-4">
                  <button onClick={() => setShowConfirm(false)} className="flex-1 btn-outline py-3">Cancel</button>
                  <button onClick={handleDelete} className="flex-1 btn-danger py-3 shadow-[0_0_15px_rgba(244,63,94,0.4)]">Confirm Purge</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default AlertDetails;
