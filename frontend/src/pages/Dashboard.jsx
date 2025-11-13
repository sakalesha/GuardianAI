import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Dashboard = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔁 Fetch alerts from backend
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem("token"); // ✅ assume auth token stored after login
        const response = await fetch("https://guardianai-crp4.onrender.com/api/alerts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch alerts");
        }

        const data = await response.json();
        setAlerts(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  // Convert UTC → local readable
  const formatLocalTime = (utc) =>
    new Date(utc).toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading alerts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* 🔝 Top Navigation Bar */}
      <div className="flex justify-between items-center bg-white shadow-md px-6 py-3">
        <h1 className="text-xl font-bold text-gray-800">Safety Dashboard</h1>
        <div className="space-x-3">
          <button
            onClick={() => navigate("/create-alert")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Post Alert
          </button>
          <button
            onClick={() => navigate("/my-alerts")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            My Alerts
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
          >
            Admin
          </button>
        </div>
      </div>

      {/* 🗺️ Map + List Layout */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Map Section */}
        <div className="w-full md:w-2/3 h-1/2 md:h-full">
          <MapContainer
            center={[12.9716, 77.5946]}
            zoom={12}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Alert Markers */}
            {alerts.map((alert) => (
              <Marker
                key={alert._id}
                position={[alert.latitude, alert.longitude]}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-semibold text-lg">{alert.title}</h3>
                    <p className="text-gray-600 mb-1">{alert.description}</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        alert.severity === "High"
                          ? "bg-red-500 text-white"
                          : alert.severity === "Medium"
                          ? "bg-yellow-400 text-gray-900"
                          : "bg-green-400 text-gray-900"
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <p className="text-gray-500 mt-1 text-xs">
                      {formatLocalTime(alert.timestamp)}
                    </p>
                    <button
                      onClick={() => navigate(`/alerts/${alert._id}`)}
                      className="mt-2 text-blue-600 hover:underline font-medium"
                    >
                      View Details →
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* 📋 Alerts List */}
        <div className="w-full md:w-1/3 bg-gray-50 overflow-y-auto p-4">
          <h2 className="text-xl font-bold mb-3">Recent Alerts</h2>
          {alerts.length === 0 ? (
            <p className="text-gray-500">No alerts yet.</p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert._id}
                onClick={() => navigate(`/alerts/${alert._id}`)}
                className="cursor-pointer bg-white shadow-md rounded-lg mb-4 p-3 hover:shadow-lg transition-all"
              >
                {alert.mediaUrl && (
                  <img
                    src={`http://localhost:5000${alert.mediaUrl}`}
                    alt={alert.title}
                    className="h-40 w-full object-cover rounded"
                  />
                )}
                <div className="mt-2">
                  <h3 className="font-semibold text-lg">{alert.title}</h3>
                  <p className="text-gray-600 text-sm mb-1">
                    {alert.description.length > 80
                      ? alert.description.slice(0, 80) + "..."
                      : alert.description}
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span
                      className={`px-2 py-1 rounded ${
                        alert.severity === "High"
                          ? "bg-red-500 text-white"
                          : alert.severity === "Medium"
                          ? "bg-yellow-400 text-gray-900"
                          : "bg-green-400 text-gray-900"
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-gray-500">
                      {formatLocalTime(alert.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;