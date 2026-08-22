import { useScroll, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "motion/react";

interface ParallaxResult {
  opacity: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
}

/**
 * Scroll-linked hero parallax: content fades (1 -> 0), drifts down (0 -> 100px),
 * and shrinks (1 -> 0.95) over the first viewport of scroll. Returns stable
 * identity when reduced motion is requested so the element stays put.
 */
export function useHeroParallax(): ParallaxResult {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const y = useTransform(scrollY, [0, 400], [0, 100]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.95]);

  if (reduced) {
    return {
      opacity: useTransform(() => 1),
      y: useTransform(() => 0),
      scale: useTransform(() => 1),
    };
  }

  return { opacity, y, scale };
}
