"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const smoothX = useSpring(x, { stiffness: 520, damping: 34, mass: 0.35 });
  const smoothY = useSpring(y, { stiffness: 520, damping: 34, mass: 0.35 });

  useEffect(() => {
    const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isFinePointer || prefersReducedMotion) return;

    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX - 16);
      y.set(e.clientY - 16);
      
      // Determine if hovering over clickable elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" || 
        target.tagName === "A" || 
        target.closest("button") || 
        target.closest("a")
      ) {
        setHovering(true);
      } else {
        setHovering(false);
      }
    };
    
    const down = () => setClicked(true);
    const up = () => setClicked(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    
    return () => {
      setEnabled(false);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (hover: hover) and (pointer: fine) {
          * { cursor: none !important; }
        }
      `}} />
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999999] hidden md:flex items-center justify-center mix-blend-difference will-change-transform"
        style={{ x: smoothX, y: smoothY, width: "32px", height: "32px" }}
        animate={{ scale: clicked ? 0.88 : hovering ? 1.35 : 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
      >
        {/* Outer Ring */}
        <div className="w-full h-full rounded-full border-[1.5px] border-[#FFF5E1] flex items-center justify-center backdrop-blur-sm transition-colors duration-300"
             style={{ borderColor: hovering ? "#D4AF37" : "#FFF5E1" }}>
          {/* Inner Bullseye */}
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,1)]" />
        </div>
      </motion.div>
    </>
  );
}
