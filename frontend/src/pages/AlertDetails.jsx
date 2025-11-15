import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const AlertDetails = () => {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAlert = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`https://guardianai-crp4.onrender.com/api/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert(res.data);
    } catch (err) {
      console.error("Error fetching alert:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://guardianai-crp4.onrender.com/api/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Alert deleted successfully");
      navigate("/my-alerts");
    } catch (err) {
      console.error("Error deleting alert:", err);

      toast.error("Failed to delete alert");
    }
  };

  useEffect(() => {
    fetchAlert();
  }, []);

  if (loading) return <p>Loading alert...</p>;
  if (!alert) return <p>Alert not found.</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-md rounded-xl p-6">
      <h2 className="text-2xl font-semibold">{alert.title}</h2>
      <p className="text-gray-600 mt-2">{alert.description}</p>
      <p className="mt-2 text-sm text-gray-500">Severity: {alert.severity}</p>
      <p className="text-sm text-gray-500">
        Location: {alert.location || "N/A"}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Posted on {new Date(alert.createdAt).toLocaleString()}
      </p>

      {alert.mediaUrl && (
        <img
          src={`https://guardianai-crp4.onrender.com${alert.mediaUrl}`}
          alt="alert"
          className="mt-4 w-full h-64 object-cover rounded-lg"
        />
      )}

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={() => navigate(`/alerts/edit/${alert._id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default AlertDetails;
