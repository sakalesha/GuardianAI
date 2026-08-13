import { useRef, useState, type ChangeEvent } from "react";
import { Camera, ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fileToCompressedDataUrl } from "@/lib/images";

interface PhotoCaptureProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  label: string;
  hint?: string;
}

export function PhotoCapture({ value, onChange, label, hint }: PhotoCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setProcessing(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange(dataUrl);
    } catch {
      onChange(null);
    } finally {
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center gap-2 rounded-md border border-dashed bg-muted/30 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Processing photo…
      </div>
    );
  }

  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative aspect-[16/10] overflow-hidden rounded-md border bg-muted/40">
          <img src={value} alt={`${label} preview`} className="h-full w-full object-cover" />
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
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            <Trash2 className="mr-1" aria-hidden="true" />
            Remove
          </Button>
        </div>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
        <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          className="h-16 flex-col gap-1"
          onClick={() => cameraRef.current?.click()}
        >
          <Camera className="size-5" aria-hidden="true" />
          Open camera
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-16 flex-col gap-1"
          onClick={() => galleryRef.current?.click()}
        >
          <ImagePlus className="size-5" aria-hidden="true" />
          Choose photo
        </Button>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}