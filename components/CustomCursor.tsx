"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [clicked, setClicked] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    // Only mount custom tracking on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      
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
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  // Hide entirely if we are off screen
  if (pos.x === -100) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (hover: hover) and (pointer: fine) {
          * { cursor: none !important; }
        }
      `}} />
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999999] hidden md:flex items-center justify-center mix-blend-difference"
        animate={{ 
          x: pos.x - 16, 
          y: pos.y - 16, 
          scale: clicked ? 0.8 : hovering ? 1.5 : 1
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
        style={{ width: "32px", height: "32px" }}
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
