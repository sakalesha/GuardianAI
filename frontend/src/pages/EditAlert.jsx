import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const EditAlert = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "Low",
    location: "",
  });
  const [media, setMedia] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`https://guardianai-crp4.onrender.com/api/alerts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({
          title: res.data.title,
          description: res.data.description,
          severity: res.data.severity,
          location: res.data.location,
        });
      } catch (err) {
        console.error("Error fetching alert:", err);
      }
    };
    fetchAlert();
  }, [id]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("severity", formData.severity);
    data.append("location", formData.location);
    if (media) data.append("media", media);

    try {
      await axios.put(`https://guardianai-crp4.onrender.com/api/alerts/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Alert updated successfully");
      navigate(`/alerts/${id}`);
    } catch (err) {
      console.error("Error updating alert:", err);

      toast.error("Failed to update alert");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-md rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-6">Edit Alert</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full border px-3 py-2 rounded"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border px-3 py-2 rounded"
          rows="4"
          required
        />
        <select
          name="severity"
          value={formData.severity}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="file"
          onChange={(e) => setMedia(e.target.files[0])}
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Update Alert
        </button>
      </form>
    </div>
  );
};

export default EditAlert;
