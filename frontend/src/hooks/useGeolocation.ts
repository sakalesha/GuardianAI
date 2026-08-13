import { useCallback, useState } from "react";

export type GeolocationStatus = "idle" | "locating" | "success" | "error";

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationState {
  status: GeolocationStatus;
  coords: GeoCoordinates | null;
  accuracy: number | null;
  error: string | null;
  locate: () => void;
}

export function geolocationErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return "Location permission was denied. Enable it or enter coordinates manually.";
    case err.POSITION_UNAVAILABLE:
      return "Your location is currently unavailable. Try again or enter coordinates manually.";
    case err.TIMEOUT:
      return "Location lookup timed out. Try again or enter coordinates manually.";
    default:
      return "Could not determine your location.";
  }
}

export function useGeolocation(): GeolocationState {
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const [coords, setCoords] = useState<GeoCoordinates | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setError("Geolocation is not supported by this browser. Enter coordinates manually.");
      return;
    }
    setStatus("locating");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setAccuracy(pos.coords.accuracy);
        setStatus("success");
      },
      (err) => {
        setStatus("error");
        setError(geolocationErrorMessage(err));
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
    );
  }, []);

  return { status, coords, accuracy, error, locate };
}