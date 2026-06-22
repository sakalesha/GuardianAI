import React, { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { COMPLAINT_CATEGORIES } from "../types";
import L from "leaflet";
import { getDistanceInMeters } from "../lib/gpsUtils";
import { Filter, X } from "lucide-react";
import { cn } from "../lib/utils";

// Fix for default marker icons in Leaflet with React
const markerIcon =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const markerShadow =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const OverdueIcon = L.divIcon({
  className: "marker-pulse-red",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const NearingDeadlineIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

import { differenceInDays, differenceInHours, isAfter } from "date-fns";

export default function MapComponent({
  complaints,
  center = [12.9716, 77.5946],
}) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showFilters, setShowFilters] = useState(false);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const statusMatch = statusFilter === "ALL" || c.status === statusFilter;
      const categoryMatch =
        categoryFilter === "ALL" || c.category === categoryFilter;
      return statusMatch && categoryMatch;
    });
  }, [complaints, statusFilter, categoryFilter]);

  // Logic for Recurring Complaint Detector (Section 3.3 of Plan)
  // DBSCAN-inspired: Find clusters of 3+ complaints of same type within 100m AND 90 days
  const hotspots = useMemo(() => {
    const clusters = [];
    const processed = new Set();

    filteredComplaints.forEach((c1) => {
      if (processed.has(c1.id)) return;

      const nearby = filteredComplaints.filter(
        (c2) =>
          c1.id !== c2.id &&
          c1.category === c2.category &&
          getDistanceInMeters(
            c1.latitude,
            c1.longitude,
            c2.latitude,
            c2.longitude,
          ) <= 100 &&
          Math.abs(
            differenceInDays(new Date(c1.timestamp), new Date(c2.timestamp)),
          ) <= 90,
      );

      if (nearby.length >= 2) {
        // 1 (self) + 2 (nearby) = 3+
        clusters.push({
          center: [c1.latitude, c1.longitude],
          count: nearby.length + 1,
          category: c1.category,
        });
        processed.add(c1.id);
        nearby.forEach((n) => processed.add(n.id));
      }
    });

    return clusters;
  }, [filteredComplaints]);

  return (
    <div className="w-full h-full rounded-xl md:rounded-3xl overflow-hidden shadow-inner border border-slate-200 relative">
      {/* Filter Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="flex justify-end items-start gap-2">
          {showFilters && (
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setCategoryFilter("ALL");
              }}
              className="p-3 bg-white text-danger rounded-xl shadow-lg pointer-events-auto flex items-center gap-2"
            >
              <X size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Reset
              </span>
            </button>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-3 rounded-xl shadow-lg flex items-center gap-2 pointer-events-auto transition-all",
              showFilters
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-900",
            )}
          >
            <Filter size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">
              Filters
            </span>
            {(statusFilter !== "ALL" || categoryFilter !== "ALL") && (
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 pointer-events-auto space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {["ALL", "PENDING", "RESOLVED", "SUSPICIOUS"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                      statusFilter === status
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {["ALL", ...COMPLAINT_CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                      categoryFilter === cat
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hotspot Circles */}
        {hotspots.map((spot, idx) => (
          <Circle
            key={`hotspot-${idx}`}
            center={spot.center}
            radius={100}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: 0.2,
              weight: 2,
              dashArray: "5, 10",
            }}
          >
            <Popup>
              <div className="p-1 text-center">
                <h3 className="font-bold text-danger text-xs uppercase tracking-wider">
                  Recurring Hotspot
                </h3>
                <p className="text-[10px] font-medium text-slate-600">
                  {spot.count} {spot.category} reports in this zone.
                </p>
              </div>
            </Popup>
          </Circle>
        ))}

        {filteredComplaints.map((complaint) => {
          const isOverdue =
            !complaint.resolutionTimestamp &&
            isAfter(new Date(), new Date(complaint.slaDeadline));
          const isNearingDeadline =
            !complaint.resolutionTimestamp &&
            !isOverdue &&
            differenceInHours(new Date(complaint.slaDeadline), new Date()) <=
              24;

          return (
            <Marker
              key={complaint.id}
              position={[complaint.latitude, complaint.longitude]}
              icon={
                isOverdue
                  ? OverdueIcon
                  : isNearingDeadline
                    ? NearingDeadlineIcon
                    : DefaultIcon
              }
            >
              <Popup>
                <div className="p-1 min-w-[120px]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm">{complaint.category}</h3>
                    {(isOverdue || isNearingDeadline) && (
                      <span className="text-[8px] bg-danger text-white px-1.5 py-0.5 rounded-full font-black animate-pulse">
                        {isOverdue ? "OVERDUE" : "URGENT"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-2 line-clamp-2">
                    {complaint.description}
                  </p>
                  <div
                    className={`text-[10px] px-2 py-0.5 rounded-full inline-block font-bold uppercase tracking-wider
                    ${
                      complaint.status === "RESOLVED"
                        ? "bg-success/10 text-success"
                        : complaint.status === "SUSPICIOUS"
                          ? "bg-danger/10 text-danger"
                          : "bg-accent/10 text-accent"
                    }`}
                  >
                    {complaint.status}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
