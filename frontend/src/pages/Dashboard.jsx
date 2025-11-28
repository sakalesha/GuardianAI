import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Loader from "../components/Loader";

// Fix Leaflet default icons
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
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const [page, setPage] = useState(1);
  const limit = 10;

  /** ---------------------------------------
   * 🔄 Fetch Alerts on Mount
   * ---------------------------------------*/
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("https://guardianai-crp4.onrender.com/api/alerts", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch alerts");

        const data = await response.json();
        setAlerts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  /** ---------------------------------------
   * 🕒 Helper to Format Timestamp
   * ---------------------------------------*/
  const formatTime = (utc) =>
    new Date(utc).toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });

  /** ---------------------------------------
   * 🔍 Filter + Sort Alerts
   * ---------------------------------------*/
  const filteredAlerts = useMemo(() => {
    const q = search.toLowerCase();
    return alerts.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q)
    );
  }, [alerts, search]);

  const sortedAlerts = useMemo(() => {
    return [...filteredAlerts].sort((a, b) =>
      sort === "newest"
        ? new Date(b.timestamp) - new Date(a.timestamp)
        : new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [filteredAlerts, sort]);

  /** ---------------------------------------
   * 📄 Pagination
   * ---------------------------------------*/
  const totalPages = Math.ceil(sortedAlerts.length / limit);
  const paginatedAlerts = sortedAlerts.slice((page - 1) * limit, page * limit);

  /** ---------------------------------------
   * 📌 Loading & Errors
   * ---------------------------------------*/
  if (loading) return <Loader text="Loading alerts..." />;

  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-600 text-lg">
        Error: {error}
      </div>
    );

  /** ---------------------------------------
   * 🎨 UI Layout
   * ---------------------------------------*/
  return (
    <div className="flex flex-col h-screen bg-gray-100">

      {/* MAP + SIDEBAR */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* 🗺️ MAP SECTION */}
        <div className="w-full md:w-2/3 h-[55vh] md:h-full shadow-md">
          <MapContainer
            center={[12.9716, 77.5946]}
            zoom={12}
            className="h-full w-full md:rounded-r-xl"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {alerts
              .filter((a) => a.latitude && a.longitude)
              .map((alert) => (
                <Marker key={alert._id} position={[alert.latitude, alert.longitude]}>
                  <Popup>
                    <div className="text-sm">
                      <h3 className="font-semibold text-lg">{alert.title}</h3>
                      <p className="text-gray-600 mb-1">{alert.description}</p>

                      {/* Severity Badge */}
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded font-medium
                          ${
                            alert.severity === "High"
                              ? "bg-red-500 text-white"
                              : alert.severity === "Medium"
                              ? "bg-yellow-400 text-black"
                              : "bg-green-400 text-black"
                          }
                        `}
                      >
                        {alert.severity}
                      </span>

                      <p className="text-gray-500 mt-1 text-xs">
                        {formatTime(alert.timestamp)}
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

        {/* 📋 SIDEBAR */}
        <div className="w-full md:w-1/3 bg-white h-full overflow-y-auto p-5 border-l border-gray-200 shadow-inner">

          {/* Search & Sort */}
          <div className="sticky top-0 bg-white pb-4 z-10 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-800">Recent Alerts</h2>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>

          {/* Alert Cards */}
          <div className="mt-4">
            {paginatedAlerts.length === 0 ? (
              <p className="text-gray-500 text-center">No alerts found.</p>
            ) : (
              paginatedAlerts.map((alert) => (
                <div
                  key={alert._id}
                  onClick={() => navigate(`/alerts/${alert._id}`)}
                  className="cursor-pointer bg-white shadow-md rounded-xl mb-4 p-3 hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  {alert.mediaUrl && (
                    <img
                      src={`https://guardianai-crp4.onrender.com${alert.mediaUrl}`}
                      alt={alert.title}
                      className="h-40 w-full object-cover rounded-lg"
                    />
                  )}

                  <div className="mt-3">
                    <h3 className="font-semibold text-lg">{alert.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {alert.description?.slice(0, 80)}...
                    </p>

                    <div className="flex justify-between items-center mt-3">
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium
                          ${
                            alert.severity === "High"
                              ? "bg-red-100 text-red-600"
                              : alert.severity === "Medium"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                          }
                        `}
                      >
                        {alert.severity}
                      </span>

                      <span className="text-xs text-gray-500">
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-5 space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Prev
              </button>

              <span className="px-3 py-1 font-semibold">{page} / {totalPages}</span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
