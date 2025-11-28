import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

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

  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  /** --------------------------------------------
   * 🌍 Auto Detect Location + Reverse Geocode
   * ---------------------------------------------*/
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation not supported.");
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;

        setForm((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon,
        }));

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const data = await res.json();

          setForm((prev) => ({
            ...prev,
            location: data.display_name || "",
          }));
        } catch {
          toast.error("Failed to detect address");
        }

        setDetecting(false);
      },
      () => {
        toast.error("Location permission denied.");
        setDetecting(false);
      }
    );
  };

  // Auto-run once on load
  useEffect(() => {
    detectLocation();
  }, []);

  /** --------------------------------------------
   * 📌 Handlers
   * ---------------------------------------------*/
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  };

  /** --------------------------------------------
   * 🚨 Submit Handler
   * ---------------------------------------------*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Login required!");

    setSubmitting(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (file) formData.append("media", file);

    try {
      await axios.post("http://localhost:5000/api/alerts", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Alert created successfully!");
      navigate("/alerts/mine");
    } catch (err) {
      toast.error("Failed to create alert");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  /** --------------------------------------------
   * 🎨 UI
   * ---------------------------------------------*/
  return (
    <div className="flex justify-center px-4 py-10 bg-gray-100 min-h-screen">

      {/* ⏳ Loader */}
      {submitting && <Loader text="Creating alert..." />}

      {!submitting && (
        <form
          onSubmit={handleSubmit}
          className="bg-white w-full max-w-md shadow-xl rounded-2xl p-6 md:p-8 border border-gray-200 animate-fadeIn"
        >
          <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
            🚨 Create a New Alert
          </h2>

          {/* Title */}
          <label className="font-medium text-gray-700">Alert Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Fire near mall"
            className="input-field"
            required
          />

          {/* Description */}
          <label className="font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            placeholder="Describe what happened..."
            className="input-field resize-none"
            required
          />

          {/* Location */}
          <label className="font-medium text-gray-700">Location</label>
          <div className="flex gap-2 mt-1 mb-4">
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Enter address or auto-detected"
              className="flex-1 input-field"
            />

            <button
              type="button"
              onClick={detectLocation}
              className="btn-primary px-4 py-2"
            >
              {detecting ? "…" : "📍"}
            </button>
          </div>

          <input type="hidden" name="latitude" value={form.latitude} />
          <input type="hidden" name="longitude" value={form.longitude} />

          {/* Media */}
          <label className="font-medium text-gray-700">Upload Media</label>
          <div className="mt-1 mb-4">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full p-3 border rounded-xl"
            />

            {preview && (
              <div className="mt-3">
                {file?.type?.startsWith("image/") ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-48 object-cover rounded-xl shadow-md"
                  />
                ) : (
                  <video
                    controls
                    src={preview}
                    className="w-full h-48 rounded-xl shadow-md"
                  />
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="btn-primary w-full py-3 mt-2">
            Submit Alert
          </button>
        </form>
      )}
    </div>
  );
}
