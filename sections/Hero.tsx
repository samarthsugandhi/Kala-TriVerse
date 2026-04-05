"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    
    // Custom soft spotlight tracking cursor
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20"
      style={{ backgroundColor: "var(--bg-charcoal)" }}
    >
      {/* Dynamic Cursor Spotlight Effect */}
      {mounted && (
        <motion.div
          className="pointer-events-none fixed z-0 transition-opacity duration-1000"
          animate={{ x: mousePos.x - 300, y: mousePos.y - 300 }}
          transition={{ type: "tween", ease: "linear", duration: 0.1 }}
          style={{
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0) 60%)",
            borderRadius: "50%",
            filter: "blur(40px)",
          }}
        />
      )}

      {/* Main Stage Spotlight (Fixed Background) */}
      <div className="absolute inset-x-0 top-0 h-full w-full pointer-events-none stage-spotlight z-0" />
      
      {/* Subtle floating particles (dust in spotlight) */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-30 pointer-events-none hidden md:block">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[var(--ivory)] blur-[1px]"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto w-full">
        
        {/* Subtle top indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          className="mb-8 font-script text-xs md:text-sm text-[var(--antique-gold)] tracking-[0.3em] uppercase italic flex items-center gap-4"
        >
          <span className="w-8 h-[1px] bg-[var(--antique-gold-soft)]" />
          The Final Act
          <span className="w-8 h-[1px] bg-[var(--antique-gold-soft)]" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
          className="flex flex-col gap-2 mb-8"
        >
          <h1 className="font-cinema uppercase tracking-widest leading-none drop-shadow-2xl"
              style={{ fontSize: "clamp(3rem, 10vw, 7rem)", color: "var(--ivory)" }}>
            KALA <br className="md:hidden" />
            <span className="text-gold-gradient inline-block mt-2 md:mt-0">TriVerse</span>
          </h1>
          <h2 className="font-cinema uppercase tracking-[0.4em] text-lg md:text-3xl text-[var(--antique-gold)] font-light mt-4">
            Fusion Fest
          </h2>
        </motion.div>

        {/* Divider Pattern */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 1.5 }}
          className="w-full max-w-[200px] flex items-center justify-center my-6"
        >
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[var(--antique-gold)]" />
          <div className="w-2 h-2 rotate-45 border border-[var(--antique-gold)] mx-3 bg-[var(--bg-charcoal)]" />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[var(--antique-gold)]" />
        </motion.div>

        {/* Subtitle / Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 1.8 }}
          className="font-script text-[var(--ivory-muted)] text-base md:text-xl max-w-2xl leading-relaxed italic mb-14"
        >
          An intersection of rhythm, emotion, and creativity. <br className="hidden md:block"/>
          Step inside the art of Dance, Drama, and Culinary Expression.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 2.2 }}
          className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
        >
          <button
            onClick={() => document.querySelector("#register")?.scrollIntoView({ behavior: "smooth" })}
            className="engraved-btn font-cinema tracking-widest uppercase px-12 py-4 text-sm"
          >
            Take the Stage
          </button>
          
          <button
            onClick={() => document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" })}
            className="group font-script italic tracking-wider text-[var(--ivory-muted)] hover:text-[var(--antique-gold)] transition-colors px-12 py-4 flex items-center justify-center gap-3"
          >
            Read the Script
            <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
