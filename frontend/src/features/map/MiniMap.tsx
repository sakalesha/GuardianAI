import { MapContainer, Marker } from "react-leaflet";
import { ThemeTileLayer, pinIcon } from "@/features/map/MapView";

interface MiniMapProps {
  lat: number;
  lng: number;
  color?: string;
  className?: string;
}

export function MiniMap({ lat, lng, color = "#0f766e", className }: MiniMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      touchZoom={false}
      zoomControl={false}
      attributionControl={false}
      className={className ?? "h-48 w-full"}
      aria-label="Map showing the report location"
    >
      <ThemeTileLayer />
      <Marker position={[lat, lng]} icon={pinIcon(color)} />
    </MapContainer>
  );
}