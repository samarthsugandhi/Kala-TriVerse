"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// Audio file for loading screen curtain reveal
const SOUND_FX_URL = "/biosStart.opus"; 

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"enter" | "text" | "open" | "done">("enter");

  useEffect(() => {
    // 1. Text fades in after a short delay
    const t0 = setTimeout(() => setPhase("text"), 500);
    // 2. Play Audio & Open curtains
    const t1 = setTimeout(() => {
      setPhase("open");
      try {
        const audio = new Audio(SOUND_FX_URL);
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio autoplay blocked by browser policy"));
      } catch (err) {}
    }, 3000);
    // 3. Unmount after reveal
    const t2 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 5500);

    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center bg-black">
      
      {/* 🎭 Royal Maroon Curtains */}
      <motion.div
        className="absolute inset-y-0 left-0 w-[51%] z-10"
        style={{
          background: "linear-gradient(90deg, #300000 0%, #800000 50%, #4A0000 100%)",
          boxShadow: "inset -20px 0 50px rgba(0,0,0,0.8)",
          backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.2) 80px)"
        }}
        initial={{ x: 0 }}
        animate={{ x: phase === "open" ? "-100%" : 0 }}
        transition={{ duration: 2.2, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="absolute inset-y-0 right-0 w-[51%] z-10"
        style={{
          background: "linear-gradient(-90deg, #300000 0%, #800000 50%, #4A0000 100%)",
          boxShadow: "inset 20px 0 50px rgba(0,0,0,0.8)",
          backgroundImage: "repeating-linear-gradient(-90deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.2) 80px)"
        }}
        initial={{ x: 0 }}
        animate={{ x: phase === "open" ? "100%" : 0 }}
        transition={{ duration: 2.2, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* 🎬 Center Text Reveal (Behind the curtains) */}
      <AnimatePresence>
        {(phase === "text" || phase === "open") && (
          <motion.div
            className="relative z-20 flex flex-col items-center gap-6"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)", transition: { duration: 1 } }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-4xl text-[var(--antique-gold)] opacity-80"
              style={{ filter: "drop-shadow(0 0 15px rgba(212,175,55,0.4))" }}
            >
              🎭
            </motion.div>
            
            <h1 className="font-cinema text-3xl md:text-5xl tracking-[0.2em] uppercase text-gold-gradient font-bold drop-shadow-2xl text-center">
              RISE Presents
            </h1>
            
            <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-[var(--antique-gold-soft)] to-transparent" />
            
            <p className="font-script text-sm md:text-base text-[var(--ivory-dim)] italic tracking-wider">
              A Cinematic Cultural Experience
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-[#0F0F0F] z-0" />
    </div>
  );
}
