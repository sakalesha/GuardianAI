import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowUpRight, Crosshair } from "lucide-react";
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

function clusterIcon(count: number, color: string): L.DivIcon {
  return L.divIcon({
    className: "civic-div-icon",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:${color};color:#fff;font:600 12px/1 system-ui,sans-serif;border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.35)">${count}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
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

function dominantColor(complaints: Complaint[]): string {
  const counts = new Map<string, number>();
  for (const c of complaints) {
    const col = statusColor(c.status);
    counts.set(col, (counts.get(col) ?? 0) + 1);
  }
  let best = statusColor("PENDING");
  let max = -1;
  for (const [col, n] of counts) {
    if (n > max) {
      max = n;
      best = col;
    }
  }
  return best;
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

function FitBounds({ complaints }: { complaints: Complaint[] }) {
  const map = useMap();
  const signature = useMemo(
    () => complaints.map((c) => c.id).join("|"),
    [complaints],
  );

  useEffect(() => {
    if (!complaints.length) return;
    const bounds = L.latLngBounds(complaints.map((c) => [c.latitude, c.longitude]));
    if (!bounds.isValid()) return;
    if (complaints.length === 1) {
      map.setView(bounds.getCenter(), 15);
    } else {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, map]);

  return null;
}

function LocateControl() {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const locate = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { duration: 1.2 });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        toast.error(geolocationErrorMessage(err));
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

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
      {locating ? "Locating…" : "My location"}
    </Button>
  );
}

const LEGEND: { label: string; color: string }[] = [
  { label: "Pending / active", color: statusColor("PENDING") },
  { label: "Needs review", color: statusColor("NEEDS_HUMAN_REVIEW") },
  { label: "Tentative", color: statusColor("VERIFIED_TENTATIVE") },
  { label: "Resolved", color: statusColor("RESOLVED") },
  { label: "Rejected", color: statusColor("REJECTED_ML") },
  { label: "Dismissed", color: statusColor("DISMISSED") },
];

function MapOverlay() {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] flex flex-col items-start gap-2">
      <div
        className="pointer-events-none rounded-md border bg-card/95 p-2 text-xs shadow-sm backdrop-blur"
        aria-hidden="true"
      >
        {LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 py-0.5">
            <span
              className="size-2.5 shrink-0 rounded-full border border-black/10"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>
      <LocateControl />
    </div>
  );
}

function PopupContent({ complaint }: { complaint: Complaint }) {
  const cat = categoryMeta(complaint.category);
  const CatIcon = cat.icon;
  return (
    <div className="min-w-44 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-sm font-semibold">
          <CatIcon className="size-4" aria-hidden="true" />
          {cat.label}
        </span>
        <StatusBadge status={complaint.status} />
      </div>
      <p className="line-clamp-2 text-xs text-muted-foreground">
        {complaint.description || "No description provided."}
      </p>
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

function ClusterLayer({ complaints }: { complaints: Complaint[] }) {
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
            icon={clusterIcon(cluster.complaints.length, dominantColor(cluster.complaints))}
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
}

export function MapView({ complaints, fitOnMount = true }: MapViewProps) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="relative h-full w-full"
    >
      <ThemeTileLayer />
      {fitOnMount && <FitBounds complaints={complaints} />}
      <ClusterLayer complaints={complaints} />
      <MapOverlay />
    </MapContainer>
  );
}