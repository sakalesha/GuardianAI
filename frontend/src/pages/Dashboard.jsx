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

  // Data
  const [alerts, setAlerts] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Sort
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch alert data
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "https://guardianai-crp4.onrender.com/api/alerts",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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

  const formatLocalTime = (utc) =>
    new Date(utc).toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });

  // Search filtering
  const filtered = alerts.filter((a) => {
    const s = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(s) ||
      (a.category && a.category.toLowerCase().includes(s)) ||
      (a.location && a.location.toLowerCase().includes(s))
    );
  });

  // Sorting
  const sorted = filtered.sort((a, b) =>
    sort === "newest"
      ? new Date(b.timestamp) - new Date(a.timestamp)
      : new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Pagination
  const totalPages = Math.ceil(sorted.length / limit);
  const paginatedAlerts = sorted.slice((page - 1) * limit, page * limit);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading alerts...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        Error: {error}
      </div>
    );

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      {/* MAIN LAYOUT */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0">

        {/* -------------------- */}
        {/* MAP SECTION */}
        {/* -------------------- */}
        <div className="w-full md:w-2/3 h-[60vh] md:h-[90vh]">
          <MapContainer
            center={[12.9716, 77.5946]}
            zoom={12}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {alerts
              .filter((a) => a.latitude && a.longitude)
              .map((alert) => (
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
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View Details →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>

        {/* -------------------- */}
        {/* ALERTS PANEL */}
        {/* -------------------- */}
        <div className="w-full md:w-1/3 bg-gray-50 h-full overflow-y-auto p-4">

          {/* Sticky Search + Sort */}
          <div className="sticky top-0 bg-gray-50 pb-3 z-10">

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">Recent Alerts</h2>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border rounded px-2 py-1 text-sm bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Search title, category, location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full mb-3 px-3 py-2 border rounded bg-white"
            />
          </div>

          {/* Alert Cards */}
          {paginatedAlerts.length === 0 ? (
            <p className="text-gray-500">No alerts found.</p>
          ) : (
            paginatedAlerts.map((alert) => (
              <div
                key={alert._id}
                onClick={() => navigate(`/alerts/${alert._id}`)}
                className="cursor-pointer bg-white shadow-md rounded-lg mb-4 p-3 hover:shadow-lg transition-all"
              >
                {alert.mediaUrl && (
                  <img
                    src={`https://guardianai-crp4.onrender.com${alert.mediaUrl}`}
                    alt={alert.title}
                    className="h-40 w-full object-cover rounded"
                  />
                )}
                <div className="mt-2">
                  <h3 className="font-semibold text-lg">{alert.title}</h3>
                  <p className="text-gray-600 text-sm mb-1">
                    {alert.description.slice(0, 80)}...
                  </p>
                  <div className="flex justify-between text-sm">
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Prev
              </button>

              <span className="px-3 py-1 font-semibold">
                {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
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
