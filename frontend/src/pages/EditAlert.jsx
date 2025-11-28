import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

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

  // -------------------------------
  // Fetch existing alert details
  // -------------------------------
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
          setPreview(`https://guardianai-crp4.onrender.com${mediaUrl}`);
        }
      } catch (error) {
        toast.error("Failed to load alert");
      } finally {
        setLoading(false);
      }
    };

    fetchAlert();
  }, [id]);

  // -------------------------------
  // Handlers
  // -------------------------------
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMedia(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      data.append(key, value)
    );

    if (media) data.append("media", media);

    try {
      await axios.put(
        `https://guardianai-crp4.onrender.com/api/alerts/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Alert updated successfully");
      navigate(`/alerts/${id}`);
    } catch (error) {
      toast.error("Failed to update alert");
    }
  };

  // -------------------------------
  // Loading UI
  // -------------------------------
  if (loading) return <Loader text="Fetching alert..." />;

  // -------------------------------
  // Component UI
  // -------------------------------
  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-xl rounded-2xl p-6 md:p-8 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">✏️ Edit Alert</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Title */}
        <div>
          <label className="text-gray-700 font-medium">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter alert title"
            className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-gray-700 font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the incident"
            rows={4}
            className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Severity */}
        <div>
          <label className="text-gray-700 font-medium">Severity</label>
          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="text-gray-700 font-medium">Location</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter location"
            className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Media Upload */}
        <div>
          <label className="text-gray-700 font-medium">Upload New Media</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full mt-1 p-3 border rounded-xl"
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className="mt-5">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-64 object-cover rounded-xl shadow-md border"
            />
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition shadow"
        >
          Update Alert
        </button>
      </form>
    </div>
  );
};

export default EditAlert;
