"use client";
import { motion, useReducedMotion } from "motion/react";

// The first page a visitor lands on renders immediately (no fade), so content paints as early as possible.
let firstRender = true;

/** Re-mounts on every navigation, so each page settles in with a short fade and lift. */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const animate = !firstRender && !reduce;
  firstRender = false;
  return (
    <motion.div initial={animate ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, ease: [0.2, 0.7, 0.2, 1] }}>
      {children}
    </motion.div>
  );
}
