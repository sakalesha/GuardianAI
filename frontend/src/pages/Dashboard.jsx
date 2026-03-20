import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/** ---------------------------------------
 * 🔥 Custom Heatmap Layer Component
 * ---------------------------------------*/
function HeatmapLayer({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || !points.length) return;
    const heatPoints = points.filter(p => p.latitude && p.longitude).map(p => [
      p.latitude, 
      p.longitude, 
      p.severity === 'High' ? 1.0 : (p.severity === 'Medium' ? 0.6 : 0.3)
    ]);
    const heatLayer = L.heatLayer(heatPoints, { radius: 25, blur: 15, maxZoom: 17, gradient: {0.4: 'cyan', 0.65: 'yellow', 1: 'red'} }).addTo(map);
    return () => { map.removeLayer(heatLayer); };
  }, [points, map]);
  return null;
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [mapMode, setMapMode] = useState("clusters"); // "markers", "clusters", "heatmap"

  const [page, setPage] = useState(1);
  const limit = 10;

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

  const formatTime = (utc) =>
    new Date(utc).toLocaleString(undefined, {
      hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short",
    });

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

  const totalPages = Math.ceil(sortedAlerts.length / limit);
  const paginatedAlerts = sortedAlerts.slice((page - 1) * limit, page * limit);

  // Quick Stats Aggregation
  const stats = useMemo(() => {
    const total = alerts.length;
    const high = alerts.filter(a => a.severity === 'High').length;
    const medium = alerts.filter(a => a.severity === 'Medium').length;
    const low = alerts.filter(a => (a.severity === 'Low' || a.severity === 'Resolved' || !a.severity)).length;
    return { total, high, medium, low };
  }, [alerts]);

  /** ---------------------------------------
   * 🎨 Skeleton Loader Component
   * ---------------------------------------*/
  const AlertSkeleton = () => (
    <div className="card p-4 mb-4">
      <div className="w-full h-32 skeleton rounded-lg mb-3"></div>
      <div className="h-5 w-3/4 skeleton rounded mb-2"></div>
      <div className="h-4 w-1/2 skeleton rounded mb-4"></div>
      <div className="flex justify-between items-center mt-3">
        <div className="h-4 w-16 skeleton rounded"></div>
        <div className="h-4 w-20 skeleton rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-midnight overflow-hidden text-textSecondary">
      
      {/* FULL SCREEN LAYOUT */}
      <div className="flex flex-col md:flex-row flex-1 h-full overflow-hidden">

        {/* 🗺️ MAP SECTION */}
        <div className="relative w-full md:w-2/3 h-[50vh] md:h-full border-r border-border shadow-lg z-0">
          
          {/* Map Toolbar Overlay */}
          <div className="absolute top-4 right-4 z-[400] bg-panel/90 backdrop-blur border border-border rounded-xl p-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.5)] flex gap-1">
            <button 
              onClick={() => setMapMode('markers')} 
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${mapMode === 'markers' ? 'bg-electric text-white shadow-[0_0_10px_rgba(59,130,246,0.6)]' : 'text-textMuted hover:text-textPrimary hover:bg-navy'}`}
            >
              Pins
            </button>
            <button 
              onClick={() => setMapMode('clusters')} 
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${mapMode === 'clusters' ? 'bg-electric text-white shadow-[0_0_10px_rgba(59,130,246,0.6)]' : 'text-textMuted hover:text-textPrimary hover:bg-navy'}`}
            >
              Clusters
            </button>
            <button 
              onClick={() => setMapMode('heatmap')} 
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${mapMode === 'heatmap' ? 'bg-rose text-white shadow-[0_0_10px_rgba(244,63,94,0.6)]' : 'text-textMuted hover:text-textPrimary hover:bg-navy'}`}
            >
              Heatmap
            </button>
          </div>

          <MapContainer center={[12.9716, 77.5946]} zoom={12} className="h-full w-full bg-midnight">
            {/* Dark Map Tiles */}
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://carto.com/">CARTO</a>' />

            {/* Selected Layer */}
            {mapMode === 'heatmap' && <HeatmapLayer points={alerts} />}
            
            {(mapMode === 'markers' || mapMode === 'clusters') && (
              mapMode === 'clusters' ? (
                <MarkerClusterGroup>
                  {alerts.filter(a => a.latitude && a.longitude).map(alert => (
                    <Marker key={alert._id} position={[alert.latitude, alert.longitude]}>
                      <Popup className="dark-popup">
                        <div className="text-sm p-1">
                          <h3 className="font-display font-bold text-lg text-gray-900 leading-tight mb-1">{alert.title}</h3>
                          <p className="text-gray-600 mb-2">{alert.description?.slice(0, 60)}...</p>
                          <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider rounded font-bold ${
                              alert.severity === "High" ? "bg-red-500 text-white" : 
                              alert.severity === "Medium" ? "bg-yellow-500 text-black" : "bg-emerald-500 text-black"
                            }`}>
                            {alert.severity}
                          </span>
                          <button onClick={() => navigate(`/alerts/${alert._id}`)} className="block mt-3 text-blue-600 font-bold hover:underline">
                            View Details →
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              ) : (
                alerts.filter(a => a.latitude && a.longitude).map(alert => (
                  <Marker key={alert._id} position={[alert.latitude, alert.longitude]}>
                    <Popup>
                      <div className="text-sm p-1">
                        <h3 className="font-display font-bold text-lg text-gray-900 leading-tight mb-1">{alert.title}</h3>
                        <p className="text-gray-600 mb-2">{alert.description?.slice(0, 60)}...</p>
                        <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider rounded font-bold ${
                              alert.severity === "High" ? "bg-red-500 text-white" : 
                              alert.severity === "Medium" ? "bg-yellow-500 text-black" : "bg-emerald-500 text-black"
                            }`}>
                            {alert.severity}
                        </span>
                        <button onClick={() => navigate(`/alerts/${alert._id}`)} className="block mt-3 text-blue-600 font-bold hover:underline">
                          View Details →
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))
              )
            )}
          </MapContainer>
        </div>

        {/* 📋 SIDEBAR FEED */}
        <div className="w-full md:w-1/3 bg-navy h-full overflow-y-auto custom-scrollbar flex flex-col relative">

          {/* Quick Stats Panel */}
          <div className="p-4 border-b border-border bg-gradient-to-br from-panel to-navy sticky top-0 z-10 shadow-md">
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-display font-bold text-textPrimary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_8px_#10B981] animate-pulse"></span>
                Live Intelligence
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[1,2,3,4].map(i => <div key={i} className="h-16 skeleton rounded-lg"></div>)}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 mb-2 text-center">
                <div className="bg-midnight border border-border rounded-lg p-2">
                  <div className="text-xs text-textMuted uppercase tracking-wider mb-1">Total</div>
                  <div className="text-lg font-mono font-bold text-electric">{stats.total}</div>
                </div>
                <div className="bg-midnight border border-rose/30 rounded-lg p-2">
                  <div className="text-[10px] text-textMuted uppercase tracking-wider mb-1">High</div>
                  <div className="text-lg font-mono font-bold text-rose drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">{stats.high}</div>
                </div>
                <div className="bg-midnight border border-amber/30 rounded-lg p-2">
                  <div className="text-[10px] text-textMuted uppercase tracking-wider mb-1">Med</div>
                  <div className="text-lg font-mono font-bold text-amber">{stats.medium}</div>
                </div>
                <div className="bg-midnight border border-emerald/30 rounded-lg p-2">
                  <div className="text-[10px] text-textMuted uppercase tracking-wider mb-1">Clear</div>
                  <div className="text-lg font-mono font-bold text-emerald">{stats.low}</div>
                </div>
              </div>
            )}

            {/* Feed Controls */}
            <div className="flex gap-2 mt-4 items-center">
              <div className="flex-[7]">
                <input
                  type="text"
                  placeholder="Search location, hazard..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="input-field py-2 text-sm bg-midnight"
                />
              </div>
              <div className="flex-[3] min-w-[70px]">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="input-field py-2 px-1 text-xs bg-midnight appearance-none text-center"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Alert Cards Feed */}
          <div className="flex-1 p-4 overflow-y-auto">
            {error && (
              <div className="text-rose bg-rose/10 p-4 rounded-xl text-sm border border-rose/20 text-center">
                ⚠️ Interface disruption: {error}
              </div>
            )}

            {loading ? (
              <>
                 <AlertSkeleton />
                 <AlertSkeleton />
                 <AlertSkeleton />
              </>
            ) : paginatedAlerts.length === 0 ? (
              
              /* Engagment Recovery Empty State */
              <div className="flex flex-col items-center justify-center h-48 text-center mt-12 bg-panel/30 border border-border/50 rounded-2xl p-6">
                <svg className="w-16 h-16 text-electric/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-textPrimary font-semibold mb-1 tracking-wide">The sector looks clear</h3>
                <p className="text-sm text-textMuted mb-4">No imminent threats detected matching those parameters.</p>
                <div className="flex gap-3">
                   {search && (
                     <button onClick={() => setSearch('')} className="btn-outline text-xs px-3 py-1">Clear Filters</button>
                   )}
                   <button onClick={() => navigate('/create-alert')} className="btn-primary text-xs px-3 py-1">Report Anomaly</button>
                </div>
              </div>

            ) : (
              paginatedAlerts.map((alert) => (
                <div
                  key={alert._id}
                  onClick={() => navigate(`/alerts/${alert._id}`)}
                  className="card p-4 mb-4 card-hover bg-panel group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 uppercase tracking-wider rounded font-bold border
                        ${
                          alert.severity === "High"
                            ? "border-rose text-rose bg-rose/10 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                            : alert.severity === "Medium"
                            ? "border-amber text-amber bg-amber/10 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                            : "border-emerald text-emerald bg-emerald/10 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                        }
                      `}
                    >
                      {alert.severity || "Unknown"}
                    </span>
                    <span className="text-[10px] font-mono text-textMuted group-hover:text-electric transition-colors">
                      {formatTime(alert.createdAt)}
                    </span>
                  </div>

                  {alert.mediaUrl && (
                    <div className="h-32 mb-3 overflow-hidden rounded-lg border border-border">
                      <img
                        src={alert.mediaUrl.startsWith("http") || alert.mediaUrl.startsWith("data:") ? alert.mediaUrl : `https://guardianai-crp4.onrender.com${alert.mediaUrl}`}
                        alt={alert.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <h3 className="font-display font-bold text-lg text-textPrimary leading-tight mb-2 group-hover:text-electric transition-colors">
                    {alert.title}
                  </h3>
                  <p className="text-sm line-clamp-2">
                    {alert.description}
                  </p>

                  {/* Trust Signal: AI Confidence - Front end simulation if not fully populated via DB yet */}
                  <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs">
                     <div className="flex gap-2 items-center text-textMuted">
                        <svg className="w-3.5 h-3.5 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        ai_conf: <span className="text-emerald font-mono">{(alert.aiConfidence || 0.85 * 100).toFixed(0)}%</span>
                     </div>
                     <span className="font-mono text-electric opacity-50 text-[10px] uppercase">ID:{alert._id.slice(-6)}</span>
                  </div>
                </div>
              ))
            )}
            
            {/* Pagination block */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center mt-6 mb-4 gap-3 items-center">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="btn-outline px-3 py-1 text-xs disabled:opacity-30"
                >
                  PREV
                </button>
                <span className="text-sm font-mono text-textPrimary tracking-widest">{page}/{totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="btn-outline px-3 py-1 text-xs disabled:opacity-30"
                >
                  NEXT
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
