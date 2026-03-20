import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { FiMapPin, FiCamera, FiUploadCloud, FiAlertTriangle } from "react-icons/fi";

export default function CreateAlert() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [detecting, setDetecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 🔍 AUTOCOMPLETE STATES
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation vectors unavailable.", { style: { background: '#0F1628', color: '#F43F5E', border: '1px solid #1E2D50' } });
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = coords.latitude;
        const lon = coords.longitude;

        setForm((prev) => ({ ...prev, latitude: lat, longitude: lon }));

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
            { headers: { "User-Agent": "SafetyAlertApp/1.0" } }
          );
          const data = await res.json();
          setForm((prev) => ({ ...prev, location: data.display_name || "" }));
        } catch (err) {
          toast.error("Failed to reverse geocode coordinates");
        }
        setDetecting(false);
      },
      () => {
        toast.error("Location array permission denied.");
        setDetecting(false);
      }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]); return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
        { headers: { "User-Agent": "SafetyAlertApp/1.0" } }
      );
      const data = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
    setIsSearching(false);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Authentication override required!");

    setSubmitting(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (file) formData.append("media", file);

    try {
      await axios.post("https://guardianai-crp4.onrender.com/api/alerts", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Incident Report successfully compiled and dispatched!", {
         style: { background: '#0F1628', color: '#10B981', border: '1px solid #1E2D50' }
      });
      navigate("/my-alerts");
    } catch (err) {
      toast.error("Telemetry upload failed.", { style: { background: '#0F1628', color: '#F43F5E', border: '1px solid #1E2D50' } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-start pt-10 px-4 min-h-screen pb-20">
      {submitting && <Loader text="Encrypting & Dispatching Telemetry..." />}

      {!submitting && (
        <form onSubmit={handleSubmit} className="bg-panel w-full max-w-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl p-8 border border-border animate-fadeIn">
          
          <div className="flex flex-col items-center mb-8 border-b border-border pb-6">
             <div className="w-16 h-16 rounded-2xl bg-amber/10 border border-amber/30 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <FiAlertTriangle className="text-amber" size={32} />
             </div>
             <h2 className="text-3xl font-display font-bold text-textPrimary text-center tracking-wide">
               Compile Incident Report
             </h2>
             <p className="text-textMuted text-sm font-mono mt-2 tracking-widest uppercase">System Uplink Active</p>
          </div>

          <div className="space-y-6">
             {/* Title */}
             <div>
               <label className="block text-xs font-mono text-electric tracking-widest uppercase mb-2">Subject Designation</label>
               <input
                 type="text"
                 name="title"
                 value={form.title}
                 onChange={handleChange}
                 placeholder="e.g. Substation Transformer Fire"
                 className="input-field text-lg font-bold"
                 required
               />
             </div>

             {/* Description */}
             <div>
               <label className="block text-xs font-mono text-electric tracking-widest uppercase mb-2">Situation Report</label>
               <textarea
                 name="description"
                 value={form.description}
                 onChange={handleChange}
                 rows="4"
                 placeholder="Provide detailed observations..."
                 className="textarea-field"
                 required
               />
             </div>

             {/* Location Area */}
             <div className="bg-midnight border border-border rounded-xl p-5 shadow-inner">
               <label className="block text-xs font-mono text-emerald tracking-widest uppercase mb-4 flex items-center gap-2">
                 <FiMapPin /> Spatial Coordinates
               </label>

               <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="w-full relative">
                     <input
                       type="text"
                       name="location"
                       value={form.location}
                       onChange={(e) => { handleChange(e); fetchSuggestions(e.target.value); }}
                       placeholder="Enter street or landmark..."
                       className="input-field bg-panel"
                     />
                     {isSearching && (
                       <div className="absolute right-3 top-3.5 w-4 h-4 rounded-full border-t-2 border-electric animate-spin"></div>
                     )}
                     
                     {suggestions.length > 0 && (
                       <ul className="absolute z-20 left-0 right-0 bg-panel border-x border-b border-border rounded-b-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] max-h-48 overflow-auto custom-scrollbar">
                         {suggestions.map((s, i) => (
                           <li
                             key={i}
                             onClick={() => {
                               setForm({ ...form, location: s.display_name, latitude: s.lat, longitude: s.lon });
                               setSuggestions([]);
                             }}
                             className="p-3 border-t border-border/50 hover:bg-navy cursor-pointer text-sm text-textSecondary hover:text-white transition-colors"
                           >
                             {s.display_name}
                           </li>
                         ))}
                       </ul>
                     )}
                  </div>

                  <button
                     type="button"
                     onClick={detectLocation}
                     className="md:w-auto w-full whitespace-nowrap btn-outline border-emerald/50 text-emerald hover:bg-emerald/10 hover:text-emerald px-5 py-3 shadow-[0_0_10px_rgba(16,185,129,0.1)] flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs"
                     disabled={detecting}
                  >
                     <FiMapPin /> {detecting ? "Scanning..." : "Sync GPS"}
                  </button>
               </div>
               
               <div className="mt-3 flex gap-4 text-[10px] font-mono uppercase tracking-widest text-textMuted">
                  <span>Lat: <strong className="text-electric">{form.latitude ? parseFloat(form.latitude).toFixed(6) : "PENDING"}</strong></span>
                  <span>Lon: <strong className="text-electric">{form.longitude ? parseFloat(form.longitude).toFixed(6) : "PENDING"}</strong></span>
               </div>
             </div>

             <input type="hidden" name="latitude" value={form.latitude} />
             <input type="hidden" name="longitude" value={form.longitude} />

             {/* Media Upload Area */}
             <div className="bg-midnight border border-border border-dashed rounded-xl p-6 text-center hover:border-electric transition-colors relative">
               <input
                 type="file"
                 accept="image/*,video/*"
                 onChange={handleFileChange}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               />
               <div className="flex flex-col items-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-panel border border-border flex items-center justify-center mb-3">
                     <FiCamera className="text-electric" size={20} />
                  </div>
                  <h4 className="font-bold text-textPrimary mb-1">Attach Visual Evidence</h4>
                  <p className="text-xs text-textMuted mb-4 font-mono">PNG, JPG or MP4 (Max 10MB)</p>
               </div>

               {preview && (
                 <div className="relative z-20 mt-2 border border-border rounded-lg overflow-hidden bg-panel inline-block max-w-full">
                   {file?.type?.startsWith("image/") ? (
                     <img src={preview} alt="Evidence" className="max-h-64 object-contain" />
                   ) : (
                     <video controls src={preview} className="max-h-64 object-contain" />
                   )}
                 </div>
               )}
             </div>

             {/* Submit */}
             <button type="submit" className="btn-primary w-full py-4 mt-8 flex justify-center items-center gap-3 font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.3)]">
               <FiUploadCloud size={20} /> Upload
             </button>
          </div>
        </form>
      )}
    </div>
  );
}
