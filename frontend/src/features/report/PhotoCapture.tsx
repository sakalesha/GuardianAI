import { useRef, useState, useCallback, type ChangeEvent, type DragEvent } from "react";
import { Camera, ImagePlus, Loader2, RefreshCw, Trash2, Upload, MapPin, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fileToCompressedDataUrl } from "@/lib/images";
import { cn } from "@/lib/cn";
import { motion, AnimatePresence } from "motion/react";

interface ExifData {
  latitude?: number;
  longitude?: number;
  dateTime?: Date;
  orientation?: number;
}

interface PhotoCaptureProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  label: string;
  hint?: string;
  showExif?: boolean;
  maxSizeMB?: number;
}

function readExif(file: File): Promise<ExifData | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const view = new DataView(e.target?.result as ArrayBuffer);
        if (view.getUint16(0, false) !== 0xffd8) {
          resolve(null);
          return;
        }
        let offset = 2;
        while (offset < view.byteLength) {
          const marker = view.getUint16(offset, false);
          offset += 2;
          if (marker === 0xffe1) {
            const length = view.getUint16(offset, false);
            const exifData = new Uint8Array(view.buffer, offset + 2, length - 2);
            const textDecoder = new TextDecoder();
            const exifText = textDecoder.decode(exifData);
            if (exifText.includes("Exif")) {
              const gpsInfo = parseGpsFromExif(exifData);
              const dateTime = parseDateTimeFromExif(exifText);
              resolve({ ...gpsInfo, dateTime });
              return;
            }
          } else if ((marker & 0xff00) === 0xff00) {
            offset += view.getUint16(offset, false);
          } else {
            break;
          }
        }
        resolve(null);
      } catch {
        resolve(null);
      }
    };
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
}

function parseGpsFromExif(exifData: Uint8Array): { latitude?: number; longitude?: number } {
  try {
    const textDecoder = new TextDecoder();
    const text = textDecoder.decode(exifData);
    const gpsLatMatch = text.match(/GPSLatitude[^0-9]*([0-9.]+)/);
    const gpsLonMatch = text.match(/GPSLongitude[^0-9]*([0-9.]+)/);
    const latRefMatch = text.match(/GPSLatitudeRef[^A-Z]*([NS])/);
    const lonRefMatch = text.match(/GPSLongitudeRef[^A-Z]*([EW])/);
    if (
      gpsLatMatch && gpsLatMatch[1] &&
      gpsLonMatch && gpsLonMatch[1] &&
      latRefMatch && latRefMatch[1] &&
      lonRefMatch && lonRefMatch[1]
    ) {
      let lat = parseFloat(gpsLatMatch[1]);
      let lon = parseFloat(gpsLonMatch[1]);
      if (latRefMatch[1] === "S") lat = -lat;
      if (lonRefMatch[1] === "W") lon = -lon;
      return { latitude: lat, longitude: lon };
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

function parseDateTimeFromExif(text: string): Date | undefined {
  const match = text.match(/DateTimeOriginal|CreateDate|ModifyDate/);
  if (match) {
    const dateMatch = text.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
    if (dateMatch && dateMatch[1] && dateMatch[2] && dateMatch[3] && dateMatch[4] && dateMatch[5] && dateMatch[6]) {
      return new Date(
        parseInt(dateMatch[1]),
        parseInt(dateMatch[2]) - 1,
        parseInt(dateMatch[3]),
        parseInt(dateMatch[4]),
        parseInt(dateMatch[5]),
        parseInt(dateMatch[6]),
      );
    }
  }
  return undefined;
}

export function PhotoCapture({
  value,
  onChange,
  label,
  hint,
  showExif = true,
  maxSizeMB = 10,
}: PhotoCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }
    setError(null);
    setProcessing(true);
    try {
      if (showExif) {
        const exif = await readExif(file);
        setExifData(exif);
      }
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError("Failed to process image");
      onChange(null);
    } finally {
      setProcessing(false);
    }
  }, [onChange, showExif, maxSizeMB]);

  const handleFileInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }, [handleFile]);

  const handleDrag = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    } else if (e.type === "drop") {
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    }
  }, [handleFile]);

  const handleDropZoneClick = () => {
    galleryRef.current?.click();
  };

  if (processing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex aspect-[16/10] items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground"
      >
        <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <span className="font-medium">Processing photo…</span>
          <span className="text-xs">Compressing & reading EXIF data</span>
        </div>
      </motion.div>
    );
  }

  if (value) {
    return (
      <div className="space-y-3">
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg border bg-muted/40 group">
          <img src={value} alt={`${label} preview`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          {showExif && exifData && (exifData.latitude || exifData.longitude || exifData.dateTime) && (
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5" role="status" aria-live="polite">
              {exifData.latitude != null && exifData.longitude != null && (
                <Badge tone="success" variant="solid" size="sm" className="gap-1" dot>
                  <MapPin className="size-3" />
                  GPS: {exifData.latitude.toFixed(6)}, {exifData.longitude.toFixed(6)}
                </Badge>
              )}
              {exifData.dateTime && (
                <Badge tone="info" variant="solid" size="sm" className="gap-1" dot>
                  <Clock className="size-3" />
                  {exifData.dateTime.toLocaleString()}
                </Badge>
              )}
            </div>
          )}
          {error && (
            <div className="absolute top-2 left-2 right-2">
              <Badge tone="destructive" variant="solid" size="sm" className="gap-1 w-full justify-center" dot>
                <AlertCircle className="size-3" />
                {error}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => cameraRef.current?.click()}>
            <RefreshCw className="mr-1" aria-hidden="true" />
            Retake
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => galleryRef.current?.click()}>
            <ImagePlus className="mr-1" aria-hidden="true" />
            Choose different
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => { onChange(null); setExifData(null); setError(null); }}>
            <Trash2 className="mr-1" aria-hidden="true" />
            Remove
          </Button>
        </div>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileInput} />
        <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        ref={dropZoneRef}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrag}
        onClick={handleDropZoneClick}
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-all duration-fast cursor-pointer",
          "flex flex-col items-center justify-center gap-3 p-6 aspect-[16/10]",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/30",
        )}
        role="button"
        tabIndex={0}
        aria-label="Drop zone for photo upload"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleDropZoneClick(); } }}
      >
        <AnimatePresence mode="popLayout">
          {dragActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-primary/10 rounded-lg pointer-events-none"
            />
          )}
        </AnimatePresence>
        <div className="relative z-10 flex flex-col items-center gap-3 text-center">
          <div className={cn(
            "flex size-14 items-center justify-center rounded-full transition-colors",
            dragActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}>
            <Upload className="size-7" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">Drop photo here or click to browse</p>
            <p className="text-sm text-muted-foreground">Supports JPG, PNG, HEIC • Max {maxSizeMB}MB</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }}>
              <Camera className="mr-1" aria-hidden="true" />
              Open Camera
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); galleryRef.current?.click(); }}>
              <ImagePlus className="mr-1" aria-hidden="true" />
              Choose File
            </Button>
          </div>
        </div>
      </div>
      {hint && <p className="text-xs text-muted-foreground text-center">{hint}</p>}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2" role="alert">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileInput} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
    </div>
  );
}