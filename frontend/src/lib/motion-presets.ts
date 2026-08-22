import type { Variants } from 'motion/react';

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
};

export const modalTransition: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } },
};

export const dropdownTransition: Variants = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.1, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.1, ease: [0.16, 1, 0.3, 1] } },
};

export const toastTransition: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, x: 100, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
};

export const cardHoverTransition: Variants = {
  initial: { y: 0, boxShadow: 'var(--shadow-sm)' },
  hover: { y: -4, boxShadow: 'var(--shadow-md)', transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } },
};

export const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.05 } },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: 16, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
};

export const spinnerVariants: Variants = {
  animate: { rotate: 360, transition: { duration: 1, repeat: Infinity, ease: 'linear' } },
};

export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
  },
};

export const accordionTransition: Variants = {
  closed: { height: 0, opacity: 0 },
  open: { height: 'auto', opacity: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
};

export const tabTransition: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } },
};

export const loadingSkeleton: Variants = {
  animate: {
    backgroundPosition: ['-200% 0', '200% 0'],
    transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
  },
};

export function createStaggeredList(): Variants {
  return {
    initial: { opacity: 0 },
    animate: { transition: { staggerChildren: 0.05 } },
    exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  };
}

export const durations = {
  fast: 0.1,
  normal: 0.2,
  slow: 0.3,
} as const;

export const easings = {
  easeOut: [0.16, 1, 0.3, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  easeOutBack: [0.34, 1.56, 0.64, 1] as const,
} as const;

export function createTransition(
  duration: keyof typeof durations = 'normal',
  easing: keyof typeof easings = 'easeOut',
) {
  return {
    duration: durations[duration],
    ease: easings[easing],
  };
}