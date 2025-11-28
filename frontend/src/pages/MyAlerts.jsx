import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

const API_BASE = "https://guardianai-crp4.onrender.com";

const MyAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user's alerts
  useEffect(() => {
    const loadMyAlerts = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_BASE}/api/alerts/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAlerts(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Unable to load your alerts");
      } finally {
        setLoading(false);
      }
    };

    loadMyAlerts();
  }, []);

  // Delete alert
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this alert permanently?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_BASE}/api/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlerts((prev) => prev.filter((alert) => alert._id !== id));
      toast.success("Alert deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete alert");
    }
  };

  // Loader
  if (loading) return <Loader text="Loading your alerts..." />;

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 pb-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        📂 My Alerts
      </h1>

      {alerts.length === 0 ? (
        <p className="text-gray-500 text-center mt-10 text-lg">
          You haven’t posted any alerts yet. 🚨
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              {/* Title */}
              <h2 className="text-lg font-semibold text-gray-900">
                {alert.title}
              </h2>

              {/* Description */}
              <p className="text-sm text-gray-600 mt-1">
                {alert.description?.substring(0, 100)}...
              </p>

              {/* Severity + Timestamp */}
              <div className="flex justify-between items-center mt-3">
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    alert.severity === "High"
                      ? "bg-red-100 text-red-600"
                      : alert.severity === "Medium"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {alert.severity}
                </span>

                <span className="text-xs text-gray-500">
                  {new Date(alert.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Media */}
              {alert.mediaUrl && (
                <img
                  src={`${API_BASE}${alert.mediaUrl}`}
                  alt="alert"
                  className="mt-3 w-full h-36 object-cover rounded-lg shadow-sm"
                />
              )}

              {/* Buttons */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => navigate(`/alerts/${alert._id}`)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View
                </button>

                <button
                  onClick={() => handleDelete(alert._id)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
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
