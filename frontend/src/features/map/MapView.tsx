import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowUpRight, Crosshair, MapPin, CheckCircle, AlertCircle, Clock, MapPin as MapPinIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/complaints/StatusBadge";
import { categoryMeta } from "@/lib/categories";
import { statusColor } from "@/lib/status";
import { geolocationErrorMessage } from "@/hooks/useGeolocation";
import type { Complaint } from "@/types/complaint";

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];
const DEFAULT_ZOOM = 12;

function pinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "civic-div-icon",
    html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M14 0C6.3 0 0 6.3 0 14c0 9.6 12.2 20.6 12.9 21.3a1.7 1.7 0 0 0 2.2 0C15.8 34.6 28 23.6 28 14 28 6.3 21.7 0 14 0z" fill="${color}" stroke="rgba(0,0,0,0.28)" stroke-width="1"/><circle cx="14" cy="14" r="5.5" fill="#fff"/></svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 34],
    popupAnchor: [0, -32],
  });
}
export { pinIcon };

function clusterIcon(count: number): L.DivIcon {
  return L.divIcon({
    className: "civic-div-icon",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:#1a1a2e;color:#fff;font:600 12px/1 system-ui,sans-serif;border:2px solid #2a2a4a;box-shadow:0 2px 8px rgba(0,0,0,0.4)">${count}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

interface Cluster {
  key: string;
  lat: number;
  lng: number;
  complaints: Complaint[];
}

function clusterComplaints(complaints: Complaint[], zoom: number): Cluster[] {
  const cell = 0.02 / Math.pow(2, Math.max(0, zoom - 11));
  const groups = new Map<string, Complaint[]>();
  for (const c of complaints) {
    const key = `${Math.floor(c.latitude / cell)}:${Math.floor(c.longitude / cell)}`;
    const list = groups.get(key);
    if (list) list.push(c);
    else groups.set(key, [c]);
  }
  return [...groups.entries()].map(([key, list]) => ({
    key,
    lat: list.reduce((s, c) => s + c.latitude, 0) / list.length,
    lng: list.reduce((s, c) => s + c.longitude, 0) / list.length,
    complaints: list,
  }));
}

export function ThemeTileLayer() {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const url = dark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution = dark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return <TileLayer url={url} attribution={attribution} />;
}

function FitBounds({ complaints, userLocation }: { complaints: Complaint[]; userLocation?: [number, number] | null }) {
  const map = useMap();
  const signature = useMemo(
    () => complaints.map((c) => c.id).join("|") + (userLocation ? `|${userLocation.join(",")}` : ""),
    [complaints, userLocation],
  );

  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 14, { duration: 1 });
      return;
    }
    if (!complaints.length) return;
    const bounds = L.latLngBounds(complaints.map((c) => [c.latitude, c.longitude]));
    if (!bounds.isValid()) return;
    if (complaints.length === 1) {
      map.setView(bounds.getCenter(), 15);
    } else {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, map, userLocation]);

  return null;
}

function LocateControl() {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const hasAutoLocated = useRef(false);
  const [reportsWithinRadius, setReportsWithinRadius] = useState<number | null>(null);

  const locate = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }
    setLocating(true);
    setReportsWithinRadius(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        map.flyTo(userLoc, 14, { duration: 1.2 });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        toast.error(geolocationErrorMessage(err));
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  useEffect(() => {
    if (!hasAutoLocated.current) {
      hasAutoLocated.current = true;
      locate();
    }
  }, [locate]);

  return (
    <Button
      variant="secondary"
      size="sm"
      className="pointer-events-auto shadow-sm"
      onClick={locate}
      disabled={locating}
      aria-label="Locate me"
    >
      <Crosshair className="size-4" aria-hidden="true" />
      {locating ? "Locating…" : reportsWithinRadius !== null ? `📍 ${reportsWithinRadius} nearby` : "My location"}
    </Button>
  );
}

const LEGEND: { label: string; color: string; icon: React.ReactNode }[] = [
  { label: "Reported", color: "#3b82f6", icon: <MapPinIcon className="size-3" /> },
  { label: "Under Review", color: "#f59e0b", icon: <Clock className="size-3" /> },
  { label: "Verified", color: "#10b981", icon: <CheckCircle className="size-3" /> },
  { label: "In Progress", color: "#8b5cf6", icon: <MapPinIcon className="size-3" /> },
  { label: "Resolved", color: "#22c55e", icon: <CheckCircle className="size-3" /> },
  { label: "Rejected", color: "#ef4444", icon: <AlertCircle className="size-3" /> },
  { label: "Dismissed", color: "#6b7280", icon: <AlertCircle className="size-3" /> },
];

function MapOverlay() {
  const [legendOpen, setLegendOpen] = useState(true);

  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] flex flex-col items-start gap-2">
      <div className="flex flex-col items-start gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="pointer-events-auto shadow-sm rounded-full px-2 h-8"
          onClick={() => setLegendOpen(!legendOpen)}
          aria-label={legendOpen ? "Collapse legend" : "Expand legend"}
          aria-expanded={legendOpen}
        >
          <span className="text-xs font-medium">Legend</span>
        </Button>
        {legendOpen && (
          <div className="pointer-events-auto rounded-md border bg-card/95 p-2 text-xs shadow-sm backdrop-blur animate-in slide-in-from-bottom-2">
            {LEGEND.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 py-0.5">
                <span className="flex items-center justify-center">
                  {item.icon}
                </span>
                <span style={{ color: item.color }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <LocateControl />
    </div>
  );
}

function PopupContent({ complaint }: { complaint: Complaint }) {
  const cat = categoryMeta(complaint.category);
  const CatIcon = cat.icon;
  const statusLabel = getStatusLabel(complaint.status);
  const statusIcon = getStatusIcon(complaint.status);
  const timeAgo = formatTimeAgo(complaint.createdAt);

  return (
    <div className="min-w-52 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1 text-sm font-semibold">
          <CatIcon className="size-4" aria-hidden="true" />
          {cat.label}
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {statusIcon}
          {statusLabel}
        </span>
      </div>
      <p className="line-clamp-2 text-xs text-muted-foreground">
        {complaint.description || "No description provided."}
      </p>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPinIcon className="size-3" aria-hidden="true" />
          {complaint.address || "Location unavailable"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3" aria-hidden="true" />
          {timeAgo}
        </span>
      </div>
      <Link
        to={`/reports/${complaint.id}`}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        View details
        <ArrowUpRight className="size-3" aria-hidden="true" />
      </Link>
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Reported",
    NEEDS_HUMAN_REVIEW: "Under Review",
    VERIFIED_TENTATIVE: "Verified",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    REJECTED_ML: "Rejected",
    DISMISSED: "Dismissed",
    SUSPICIOUS_CONTENT: "Flagged",
  };
  return labels[status] ?? status;
}

function getStatusIcon(status: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    PENDING: <MapPinIcon className="size-3" />,
    NEEDS_HUMAN_REVIEW: <Clock className="size-3" />,
    VERIFIED_TENTATIVE: <CheckCircle className="size-3" />,
    IN_PROGRESS: <MapPinIcon className="size-3" />,
    RESOLVED: <CheckCircle className="size-3" />,
    REJECTED_ML: <AlertCircle className="size-3" />,
    DISMISSED: <AlertCircle className="size-3" />,
    SUSPICIOUS_CONTENT: <AlertCircle className="size-3" />,
  };
  return icons[status] ?? <MapPinIcon className="size-3" />;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function ClusterLayer({ complaints, userLocation }: { complaints: Complaint[]; userLocation?: [number, number] | null }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const update = () => setZoom(map.getZoom());
    map.on("zoomend", update);
    map.on("moveend", update);
    return () => {
      map.off("zoomend", update);
      map.off("moveend", update);
    };
  }, [map]);

  const clusters = useMemo(() => clusterComplaints(complaints, zoom), [complaints, zoom]);

  return (
    <>
      {clusters.map((cluster) => {
        if (cluster.complaints.length === 1) {
          const complaint = cluster.complaints[0]!;
          return (
            <Marker
              key={complaint.id}
              position={[cluster.lat, cluster.lng]}
              icon={pinIcon(statusColor(complaint.status))}
            >
              <Popup closeButton={false}>
                <PopupContent complaint={complaint} />
              </Popup>
            </Marker>
          );
        }
        return (
          <Marker
            key={cluster.key}
            position={[cluster.lat, cluster.lng]}
            icon={clusterIcon(cluster.complaints.length)}
            eventHandlers={{ click: () => map.setView([cluster.lat, cluster.lng], zoom + 2) }}
          />
        );
      })}
    </>
  );
}

interface MapViewProps {
  complaints: Complaint[];
  fitOnMount?: boolean;
  userLocation?: [number, number] | null;
}

export function MapView({ complaints, fitOnMount = true, userLocation = null }: MapViewProps) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="relative h-full w-full"
    >
      <ThemeTileLayer />
      {fitOnMount && <FitBounds complaints={complaints} userLocation={userLocation} />}
      <ClusterLayer complaints={complaints} userLocation={userLocation} />
      <MapOverlay />
    </MapContainer>
  );
}