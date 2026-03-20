import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { FiEdit3, FiSave, FiAlertCircle, FiImage } from "react-icons/fi";

const EditAlert = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "Low",
    location: "",
  });

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `https://guardianai-crp4.onrender.com/api/alerts/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { title, description, severity, location, mediaUrl } = res.data;
        setFormData({ title, description, severity, location });

        if (mediaUrl) {
          setPreview(mediaUrl.startsWith("http") || mediaUrl.startsWith("data:") ? mediaUrl : `https://guardianai-crp4.onrender.com${mediaUrl}`);
        }
      } catch (error) {
        toast.error("Telemetry Access Denied", { style: { background: '#0F1628', color: '#F43F5E', border: '1px solid #1E2D50' } });
      } finally {
        setLoading(false);
      }
    };
    fetchAlert();
  }, [id]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMedia(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (media) data.append("media", media);

    try {
      await axios.put(`https://guardianai-crp4.onrender.com/api/alerts/${id}`, data, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      toast.success("System Database Updated", {
        style: { background: '#0F1628', color: '#10B981', border: '1px solid #1E2D50' }
      });
      navigate(`/alerts/${id}`);
    } catch (error) {
       toast.error("Database Update Failed", { style: { background: '#0F1628', color: '#F43F5E', border: '1px solid #1E2D50' } });
    }
  };

  if (loading) return <Loader text="Accessing core parameters..." />;

  // Dynamic styling for the severity dropdown
  let selectBorder = "border-border";
  if(formData.severity === "High") selectBorder = "border-rose focus:ring-rose";
  if(formData.severity === "Medium") selectBorder = "border-amber focus:ring-amber";
  if(formData.severity === "Low") selectBorder = "border-emerald focus:ring-emerald";

  return (
    <div className="max-w-3xl mx-auto mt-12 mb-20 bg-panel shadow-[0_10px_40px_rgba(0,0,0,0.6)] rounded-2xl p-8 md:p-10 border border-border">
      
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
         <div className="w-14 h-14 rounded-xl bg-midnight border-textMuted border flex items-center justify-center">
            <FiEdit3 className="text-textPrimary" size={24} />
         </div>
         <div>
            <h2 className="text-3xl font-display font-bold text-textPrimary">Configuration Matrix</h2>
            <p className="font-mono text-xs uppercase tracking-widest text-textMuted mt-1">Modifying Incident Parameters for {id.slice(-6)}</p>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Title */}
        <div>
          <label className="block text-xs font-mono text-electric tracking-widest uppercase mb-2">Primary Designation</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Alert title override..."
            className="input-field text-lg font-bold"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-mono text-electric tracking-widest uppercase mb-2">Description Vector</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Update situational report..."
            rows={5}
            className="textarea-field"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Severity */}
           <div>
             <label className="block text-xs font-mono text-amber tracking-widest uppercase mb-2 flex items-center gap-2">
                <FiAlertCircle /> Hazard Level
             </label>
             <select
               name="severity"
               value={formData.severity}
               onChange={handleChange}
               className={`w-full border bg-midnight text-textPrimary rounded-lg px-4 py-3 focus:outline-none transition-colors ${selectBorder}`}
             >
               <option value="Low" className="text-emerald">Low (Resolved / Monitor)</option>
               <option value="Medium" className="text-amber">Medium (Active Hazard)</option>
               <option value="High" className="text-rose">High (Critical Danger)</option>
             </select>
           </div>

           {/* Location */}
           <div>
             <label className="block text-xs font-mono text-electric tracking-widest uppercase mb-2">Static Location</label>
             <input
               name="location"
               value={formData.location}
               onChange={handleChange}
               placeholder="Update textual location"
               className="input-field"
             />
           </div>
        </div>

        {/* Media */}
        <div className="border border-border border-dashed rounded-xl p-6 bg-midnight/50 relative group">
          <label className="block text-xs font-mono text-textMuted tracking-widest uppercase mb-4 text-center">Update Evidence Array</label>
          <div className="relative">
             <input
               type="file"
               onChange={handleFileChange}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
             />
             <button type="button" className="w-full btn-outline border-border flex justify-center items-center gap-2 group-hover:bg-navy transition">
                <FiImage /> Select New Visual Data
             </button>
          </div>

          {preview && (
            <div className="mt-6 border border-border rounded-lg p-2 bg-panel shadow-inner">
              <p className="text-[10px] text-electric font-mono tracking-widest uppercase mb-2 text-center">Active Frame Buffer</p>
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-56 object-contain rounded-md border border-border/50"
                onError={(e) => { e.target.parentElement.style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-border mt-8 flex gap-4">
           <button type="button" onClick={() => navigate(-1)} className="flex-1 btn-outline py-3 tracking-widest uppercase text-sm font-bold">
              Cancel
           </button>
           <button
             type="submit"
             className="flex-1 btn-primary bg-emerald shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.7)] hover:bg-emerald/90 py-3 tracking-widest uppercase text-sm font-bold border-none text-white flex justify-center items-center gap-2"
           >
             <FiSave size={18} /> Update
           </button>
        </div>
      </form>
    </div>
  );
};

export default EditAlert;
