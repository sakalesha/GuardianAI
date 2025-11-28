import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

const AlertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch alert details
  const fetchAlert = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `https://guardianai-crp4.onrender.com/api/alerts/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAlert(res.data);
    } catch (err) {
      console.error("Error fetching alert:", err);
      toast.error("Unable to load alert details");
    } finally {
      setLoading(false);
    }
  };

  // Delete alert
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `https://guardianai-crp4.onrender.com/api/alerts/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Alert deleted successfully");
      navigate("/my-alerts");
    } catch (err) {
      console.error("Error deleting alert:", err);
      toast.error("Failed to delete alert");
    }
  };

  useEffect(() => {
    fetchAlert();
  }, [id]);

  // Loading state
  if (loading) return <Loader text="Loading alert details..." />;

  // Not found state
  if (!alert)
    return (
      <div className="text-center mt-20 text-red-600 text-xl">
        Alert not found.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-lg rounded-2xl p-6 md:p-8">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition mb-4"
      >
        ← Back
      </button>

      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-900">{alert.title}</h2>

      {/* Severity Badge */}
      <span
        className={`
          inline-block mt-3 px-3 py-1 text-sm font-medium rounded-full
          ${alert.severity === "High" ? "bg-red-500 text-white" : ""}
          ${alert.severity === "Medium" ? "bg-yellow-400 text-black" : ""}
          ${alert.severity === "Low" ? "bg-green-400 text-black" : ""}
        `}
      >
        {alert.severity}
      </span>

      {/* Description */}
      <p className="text-gray-700 mt-4 leading-relaxed">{alert.description}</p>

      {/* Location */}
      <p className="mt-2 text-sm text-gray-600">
        <strong>Location:</strong> {alert.location || "N/A"}
      </p>

      {/* Timestamp */}
      <p className="text-xs text-gray-400 mt-1">
        Posted on {new Date(alert.createdAt).toLocaleString()}
      </p>

      {/* Image Preview */}
      {alert.mediaUrl && (
        <img
          src={`https://guardianai-crp4.onrender.com${alert.mediaUrl}`}
          alt="alert"
          className="mt-5 w-full h-72 object-cover rounded-xl shadow-md"
        />
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={() => navigate(`/alerts/edit/${alert._id}`)}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
        >
          Edit
        </button>

        <button
          onClick={handleDelete}
          className="px-5 py-2 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default AlertDetails;
