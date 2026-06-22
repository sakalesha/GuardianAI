import {
  Camera,
  MapPin,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  Info,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { COMPLAINT_CATEGORIES } from "../types";
import { cn } from "../lib/utils";
import ErrorMessage from "./ErrorMessage";
import { motion, AnimatePresence } from "motion/react";

export default function ReportForm({ onSuccess }) {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Auto-trigger location on mount
    handleGetLocation();
  }, []);

  const handleImageCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        if (showErrors) setShowErrors(false);
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
        if (showErrors) setShowErrors(false);
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("GPS permission denied. Please enable in browser settings.");
        } else {
          setLocationError("Could not acquire GPS coordinates. Please ensure GPS is enabled.");
        }
      },
      { enableHighAccuracy: true },
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!image || !location || !category) {
      setShowErrors(true);
      return;
    }
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);
    // Simulate submission for now
    setTimeout(() => {
      onSuccess({
        category,
        description,
        imageUrl: image,
        latitude: location.lat,
        longitude: location.lng,
        timestamp: new Date().toISOString(),
        status: "PENDING",
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 pb-32 animate-slam">
      <div className="space-y-2">
        <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
          Report Issue
        </h2>
        <p className="text-secondary font-bold uppercase tracking-widest text-xs">
          Help us improve your neighborhood by reporting civic issues.
        </p>
      </div>

      {/* Image Upload */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/60">
          Visual Evidence
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative aspect-video rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group shadow-premium",
            image
              ? "border-success/50 bg-success/5"
              : showErrors && !image
                ? "border-danger bg-danger/5"
                : "border-ink/10 hover:border-primary/50 hover:bg-primary/5",
          )}
        >
          {image ? (
            <>
              <img
                src={image}
                alt="Captured"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-ink/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <Camera className="text-white" size={48} />
              </div>
            </>
          ) : (
            <>
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:rotate-6",
                  showErrors && !image
                    ? "bg-danger/10 text-danger"
                    : "bg-ink/5 text-secondary",
                )}
              >
                <Camera size={32} />
              </div>
              <span
                className={cn(
                  "text-xs font-black uppercase tracking-widest",
                  showErrors && !image ? "text-danger" : "text-ink",
                )}
              >
                Capture Reality
              </span>
              <span className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-2 opacity-60">
                Required for verification
              </span>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageCapture}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
        </div>
        <ErrorMessage
          message={
            showErrors && !image ? "Please provide a photo of the issue" : null
          }
        />
      </div>

      {/* Location */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/60">
          Geographic Data
        </label>
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={isLocating}
          className={cn(
            "w-full p-6 rounded-2xl border flex items-center justify-between transition-all shadow-premium group",
            location
              ? "border-success/50 bg-success/5 text-success"
              : showErrors && !location
                ? "border-danger bg-danger/5 text-danger"
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
                  : "Tag Location"}
            </span>
          </div>
          {location ? (
            <CheckCircle2 size={24} />
          ) : isLocating ? (
            <Loader2 className="animate-spin" size={24} />
          ) : null}
        </button>
        <ErrorMessage
          message={locationError || (showErrors && !location ? "GPS tagging is required" : null)}
        />
      </div>

      {/* Category */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/60">
          Classification
        </label>
        <div className="grid grid-cols-2 gap-4">
          {COMPLAINT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat);
                if (showErrors) setShowErrors(false);
              }}
              className={cn(
                "p-5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all text-left shadow-premium",
                category === cat
                  ? "border-primary bg-primary text-white shadow-[0_10px_20px_rgba(255,78,0,0.3)]"
                  : showErrors && !category
                    ? "border-danger/30 hover:border-danger bg-danger/5"
                    : "border-ink/5 bg-white hover:border-primary/50",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <ErrorMessage
          message={showErrors && !category ? "Please select a category" : null}
        />
      </div>

      {/* Description */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/60">
          Contextual Details (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="ADD LANDMARKS OR SPECIFIC DETAILS..."
          className="w-full p-6 rounded-2xl border border-ink/5 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none min-h-[140px] text-xs font-bold uppercase tracking-widest shadow-premium"
        />
      </div>

      <button
        type="submit"
        disabled={!image || !location || !category || isSubmitting}
        className="w-full bg-primary text-white py-6 rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(255,78,0,0.4)] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95"
      >
        {isSubmitting ? <Loader2 className="animate-spin" /> : "File Archive"}
      </button>

      <div className="flex items-start gap-4 p-6 bg-ink/5 rounded-3xl border border-ink/5">
        <AlertCircle className="text-secondary shrink-0" size={20} />
        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest leading-relaxed opacity-60">
          Your photo and GPS coordinates will be used to verify the resolution.
          Fabricated reports may lead to account suspension.
        </p>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmation(false)}
              className="absolute inset-0 bg-ink/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-white/20"
            >
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none">
                      Verify Report
                    </h3>
                    <p className="text-secondary font-bold uppercase tracking-widest text-[10px]">
                      Confirm details before filing to central archive.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="p-3 bg-ink/5 rounded-2xl text-secondary hover:text-ink transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-6 p-6 bg-paper rounded-3xl border border-ink/5">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                      <Info size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-secondary uppercase tracking-widest">
                        Category
                      </p>
                      <p className="text-sm font-black uppercase tracking-tight">
                        {category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 p-6 bg-paper rounded-3xl border border-ink/5">
                    <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center shrink-0">
                      <MapPin size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-secondary uppercase tracking-widest">
                        Location
                      </p>
                      <p className="text-sm font-black uppercase tracking-tight">
                        {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 p-6 bg-paper rounded-3xl border border-ink/5">
                    <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center shrink-0">
                      <Camera size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-secondary uppercase tracking-widest">
                        Evidence
                      </p>
                      <p className="text-sm font-black uppercase tracking-tight">
                        Visual Data Attached
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-ink/10 hover:bg-ink/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSubmit}
                    className="py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Confirm & File
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </form>
  );
}
