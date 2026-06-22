import {
  Camera,
  MapPin,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { complaintService } from "../services/api";
import ErrorMessage from "./ErrorMessage";

export default function ResolutionForm({ complaint, onSuccess }) {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Auto-trigger on mount
    handleGetLocation();
  }, []);

  const handleImageCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("GPS permission denied. Please enable in browser settings to proceed.");
        } else {
          setLocationError("Could not acquire GPS coordinates. Please ensure location services are enabled.");
        }
      },
      { enableHighAccuracy: true },
    );
  };

  const handleVerifyAndSubmit = async () => {
    if (!image || !location) return;

    // 2. Transmit to Backend Gatekeeper
    try {
      // 3. Final Submission via App.js
      onSuccess({
        // Default to RESOLVED for the payload trigger, but the Backend will actively
        // intercept this and run GPS + MobileNetV2 auto-rejects before saving it.
        status: "RESOLVED",
        resolutionImageUrl: image,
        resolutionLatitude: location.lat,
        resolutionLongitude: location.lng,
      });
    } catch (error) {
      console.error(error);
      alert("Submission failed. Ensure you are at the correct location.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-12 pb-32 animate-slam">
      <div className="space-y-2">
        <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
          Resolution
        </h2>
        <p className="text-secondary font-bold uppercase tracking-widest text-xs italic">
          Authority Verification Portal
        </p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-ink/5 shadow-premium space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-secondary/60 uppercase tracking-[0.3em]">
            Original Archive
          </span>
          <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-black uppercase tracking-widest">
            ID: {complaint.id}
          </span>
        </div>
        <div className="aspect-video rounded-3xl overflow-hidden shadow-inner border border-ink/5">
          <img
            src={complaint.imageUrl}
            alt="Original"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">
            {complaint.category}
          </p>
          <p className="text-xs font-bold text-secondary uppercase tracking-widest leading-relaxed">
            {complaint.description}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/60">
          Resolution Evidence
        </label>
        
        {image ? (
          <div className="relative aspect-video rounded-[2.5rem] border-2 border-success/50 bg-success/5 group overflow-hidden shadow-premium">
            <img
              src={image}
              alt="Resolution"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <button 
              onClick={() => { setImage(null); }}
              className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
            >
              <AlertTriangle size={20} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => cameraInputRef.current?.click()}
              className="p-8 rounded-[2rem] border-2 border-dashed border-ink/10 hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-all group"
            >
              <Camera className="text-secondary mb-3 group-hover:scale-110" size={32} />
              <span className="text-xs font-black uppercase tracking-widest text-ink">Take Field Photo</span>
              <p className="text-[9px] text-secondary font-bold uppercase mt-1 opacity-60">Uses Hardware Camera</p>
              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleImageCapture}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 rounded-[2rem] border-2 border-dashed border-ink/10 hover:border-success/50 hover:bg-success/5 flex flex-col items-center justify-center cursor-pointer transition-all group"
            >
              <Camera className="text-secondary mb-3 group-hover:scale-110" size={32} />
              <span className="text-xs font-black uppercase tracking-widest text-ink">Upload From Device</span>
              <p className="text-[9px] text-secondary font-bold uppercase mt-1 opacity-60">Must contain GPS EXIF</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageCapture}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        )}
        
        {!image && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3">
             <AlertTriangle size={16} className="text-amber-600 shrink-0" />
             <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed">
               Strict Validation: All evidence must be geotagged within 500m of the complaint. Gallery uploads will be rejected if EXIF data is missing.
             </p>
          </div>
        )}
      </div>

      {/* Location */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/60">
          Verification Data
        </label>
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={isLocating}
          className={cn(
            "w-full p-6 rounded-2xl border flex items-center justify-between transition-all shadow-premium group",
            location
              ? "border-success/50 bg-success/5 text-success"
              : "border-ink/5 bg-white hover:border-primary/50",
          )}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "p-3 rounded-xl transition-all",
                location
                  ? "bg-success/10"
                  : "bg-ink/5 group-hover:bg-primary/10",
              )}
            >
              <MapPin size={24} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">
              {isLocating
                ? "Acquiring Satellites..."
                : location
                  ? "Coordinates Locked"
                  : "Tag Resolution Location"}
            </span>
          </div>
          {location ? (
            <CheckCircle2 size={24} />
          ) : isLocating ? (
            <Loader2 className="animate-spin" size={24} />
          ) : null}
        </button>
        <ErrorMessage message={locationError} />
      </div>

      <button
        onClick={handleVerifyAndSubmit}
        disabled={!image || !location || isVerifying}
        className="w-full bg-success text-white py-6 rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95"
      >
        {isVerifying ? (
          <>
            <Loader2 className="animate-spin" />
            <span>Transmitting to Gatekeeper...</span>
          </>
        ) : (
          "Submit Photographic Evidence"
        )}
      </button>

      {/* Legacy frontend validation box removed */}
    </div>
  );
}
