import MapComponent from "../components/MapComponent";

export default function MapPage({ complaints }) {
  return (
    <div className="h-[calc(100vh-140px)] md:h-screen">
      <MapComponent complaints={complaints} />
    </div>
  );
}
