import { useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { imageWithWidth } from "@/lib/images";

interface ComplaintImageProps {
  src: string;
  alt: string;
  width?: number;
  className?: string;
  imgClassName?: string;
}

export function ComplaintImage({
  src,
  alt,
  width,
  className,
  imgClassName,
}: ComplaintImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = width ? imageWithWidth(src, width) : src;

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 bg-muted/40 text-muted-foreground",
          className,
        )}
      >
        <ImageOff className="size-5" aria-hidden="true" />
        <span className="text-xs">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-muted/40", className)}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        </div>
      )}
      <img
        src={url}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
      />
    </div>
  );
}