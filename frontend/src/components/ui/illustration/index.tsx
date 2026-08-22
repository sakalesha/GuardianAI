import { cn } from "@/lib/cn";

interface IllustrationProps {
  className?: string;
  width?: number;
  height?: number;
}

export function NoReportsIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-muted-foreground/50", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        d="M100 20L30 40V120C30 150 60 175 100 195C140 175 170 150 170 120V40L100 20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.3"
        fill="url(#shieldGrad)"
      />
      <path
        d="M100 60L70 85L95 85L95 130L105 130L105 85L130 85L100 60Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.5"
        fill="none"
      />
      <circle cx="100" cy="150" r="3" fill="currentColor" fillOpacity="0.3" />
      <circle cx="80" cy="155" r="2" fill="currentColor" fillOpacity="0.2" />
      <circle cx="120" cy="155" r="2" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

export function NoJobsIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-muted-foreground/50", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="clipboardGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect x="45" y="40" width="110" height="130" rx="8" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" fill="url(#clipboardGrad)" />
      <rect x="45" y="40" width="110" height="30" rx="8" fill="currentColor" fillOpacity="0.1" />
      <rect x="60" y="80" width="80" height="8" rx="4" fill="currentColor" fillOpacity="0.3" />
      <rect x="60" y="100" width="60" height="8" rx="4" fill="currentColor" fillOpacity="0.2" />
      <rect x="60" y="120" width="50" height="8" rx="4" fill="currentColor" fillOpacity="0.15" />
      <rect x="60" y="140" width="70" height="8" rx="4" fill="currentColor" fillOpacity="0.1" />
      <circle cx="130" cy="55" r="8" fill="currentColor" fillOpacity="0.15" />
      <path d="M126 52L130 56L134 52" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NoReviewsIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-muted-foreground/50", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gavelGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        d="M60 60L140 140"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.3"
        strokeLinecap="round"
      />
      <rect x="50" y="50" width="100" height="100" rx="8" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" fill="url(#gavelGrad)" />
      <rect x="70" y="75" width="60" height="6" rx="3" fill="currentColor" fillOpacity="0.3" />
      <rect x="70" y="90" width="40" height="6" rx="3" fill="currentColor" fillOpacity="0.2" />
      <rect x="70" y="105" width="50" height="6" rx="3" fill="currentColor" fillOpacity="0.15" />
      <circle cx="100" cy="150" r="4" fill="currentColor" fillOpacity="0.3" />
      <path d="M95 148L100 153L105 148" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NoResultsIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-muted-foreground/50", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="searchGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="85" r="35" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" fill="url(#searchGrad)" />
      <path d="M125 110L155 140" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" strokeLinecap="round" />
      <circle cx="100" cy="85" r="8" fill="currentColor" fillOpacity="0.3" />
      <path d="M95 80L100 85L105 80" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="55" y="150" width="90" height="8" rx="4" fill="currentColor" fillOpacity="0.2" />
      <rect x="70" y="165" width="60" height="6" rx="3" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

export function OfflineIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-muted-foreground/50", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wifiGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        d="M100 30C50 30 10 70 10 120C10 140 25 155 45 165"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M100 50C70 50 40 80 40 110C40 125 55 138 75 145"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="100" cy="120" r="25" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" fill="url(#wifiGrad)" />
      <line x1="100" y1="30" x2="100" y2="210" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="8 8" />
      <line x1="30" y1="120" x2="170" y2="120" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="8 8" />
      <circle cx="100" cy="120" r="6" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}

export function ErrorIllustration({ className, width = 200, height = 200 }: IllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-destructive/50", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="errorGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        d="M100 20L30 40V120C30 150 60 175 100 195C140 175 170 150 170 120V40L100 20Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.3"
        fill="url(#errorGrad)"
      />
      <circle cx="100" cy="85" r="20" fill="currentColor" fillOpacity="0.1" />
      <path d="M95 70L105 80M95 80L105 70" stroke="currentColor" strokeWidth="3" strokeOpacity="0.6" strokeLinecap="round" />
      <rect x="60" y="130" width="80" height="6" rx="3" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

export function BrandIllustration({ className, width = 240, height = 240 }: IllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brandShield" x1="0" y1="0" x2="240" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M120 30L40 55V165C40 200 80 230 120 255C160 230 200 200 200 165V55L120 30Z"
        fill="url(#brandShield)"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.4"
        filter="url(#glow)"
      />
      <path
        d="M120 75L90 105L115 105L115 175L125 175L125 105L150 105L120 75Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <circle cx="120" cy="200" r="5" fill="currentColor" fillOpacity="0.5" />
      <circle cx="100" cy="205" r="3" fill="currentColor" fillOpacity="0.3" />
      <circle cx="140" cy="205" r="3" fill="currentColor" fillOpacity="0.3" />
      <ellipse cx="120" cy="220" rx="40" ry="8" fill="currentColor" fillOpacity="0.08" />
    </svg>
  );
}