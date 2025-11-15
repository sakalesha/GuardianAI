import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🌍 Auto-detect location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      return;
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

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
          toast.error("Unable to get address!");
        }

        setDetecting(false);
      },
      () => {
        toast.error("Location permission denied.");
        setDetecting(false);
      }
    );
  };

  // Auto Detect on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Login required!");

    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (file) formData.append("media", file);

    try {
      await axios.post("http://localhost:5000/api/alerts", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Alert posted successfully!");
      setTimeout(() => navigate("/user/dashboard"), 1200);
    } catch {
      toast.error("Failed to post alert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center px-4 py-8 bg-gray-50 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 shadow-xl rounded-2xl w-full max-w-md border border-gray-100"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          🚨 Post a Neighborhood Alert
        </h2>

        {/* Title */}
        <label className="text-gray-700 font-medium">Alert Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Fire near main road"
          className="w-full mt-1 mb-4 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required
        />

        {/* Description */}
        <label className="text-gray-700 font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe what happened..."
          className="w-full mt-1 mb-4 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
          rows="3"
          required
        />

        {/* Location Field + Detect Button */}
        <label className="text-gray-700 font-medium">Location</label>
        <div className="flex gap-2 mt-1 mb-4">
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Enter address or auto-detected"
            className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />

          <button
            type="button"
            onClick={detectLocation}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition"
          >
            {detecting ? "..." : "📍"}
          </button>
        </div>

        <input type="hidden" name="latitude" value={form.latitude} />
        <input type="hidden" name="longitude" value={form.longitude} />

        {/* File Upload */}
        <label className="text-gray-700 font-medium">Upload Media</label>
        <div className="mt-1 mb-4">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="w-full p-3 border rounded-xl"
          />

          {preview && (
            <div className="mt-3">
              {file.type.startsWith("image/") ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-48 object-cover rounded-xl shadow"
                />
              ) : (
                <video
                  controls
                  src={preview}
                  className="w-full h-48 rounded-xl shadow"
                />
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-semibold shadow-md transition 
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Posting..." : "Submit Alert"}
        </button>
      </form>
    </div>
  );
}
