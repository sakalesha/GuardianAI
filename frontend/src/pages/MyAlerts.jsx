import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const MyAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMyAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://guardianai-crp4.onrender.com/api/alerts/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(res.data);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://guardianai-crp4.onrender.com/api/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(alerts.filter((a) => a._id !== id));

      toast.success("Alert deleted successfully");
    } catch (err) {
      console.error("Error deleting alert:", err);

      toast.error("Failed to delete alert");
    }
  };

  useEffect(() => {
    fetchMyAlerts();
  }, []);

  if (loading) return <p className="text-center mt-8">Loading your alerts...</p>;

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">My Alerts</h1>

      {alerts.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">
          You haven’t posted any alerts yet. 🚨
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold">{alert.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
              <div className="flex justify-between items-center mt-3">
                <span className={`text-xs px-2 py-1 rounded ${
                  alert.severity === "High"
                    ? "bg-red-100 text-red-600"
                    : alert.severity === "Medium"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-green-100 text-green-600"
                }`}>
                  {alert.severity}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(alert.createdAt).toLocaleString()}
                </span>
              </div>

              {alert.mediaUrl && (
                <img
                  src={`https://guardianai-crp4.onrender.com${alert.mediaUrl}`}
                  alt="alert media"
                  className="mt-3 w-full h-40 object-cover rounded-lg"
                />
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => navigate(`/alerts/${alert._id}`)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(alert._id)}
                  className="text-red-600 hover:underline text-sm"
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
