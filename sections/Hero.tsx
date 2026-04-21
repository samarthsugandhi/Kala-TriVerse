"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const [useSpotlight, setUseSpotlight] = useState(false);

  const x = useMotionValue(-300);
  const y = useMotionValue(-300);
  const smoothX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.45 });
  const smoothY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.45 });

  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, () => ({
        size: Math.random() * 2 + 1,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: Math.random() * 7 + 8,
        delay: Math.random() * 4,
      })),
    []
  );

  useEffect(() => {
    setMounted(true);

    const canUseSpotlight =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setUseSpotlight(canUseSpotlight);
    if (!canUseSpotlight) return;

    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX - 300);
      y.set(e.clientY - 300);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 section-shell"
      style={{ backgroundColor: "var(--bg-charcoal)" }}
    >
      {/* Dynamic Cursor Spotlight Effect */}
      {mounted && useSpotlight && (
        <motion.div
          className="pointer-events-none fixed z-0 hidden md:block will-change-transform"
          style={{
            x: smoothX,
            y: smoothY,
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
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[var(--ivory)] blur-[1px]"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: p.left,
              top: p.top,
            }}
            animate={{
              y: [0, -70, 0],
              opacity: [0, 0.45, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto w-full">

        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 w-full max-w-4xl rounded-3xl border border-[rgba(212,175,55,0.45)] bg-[linear-gradient(135deg,rgba(212,175,55,0.16),rgba(17,17,17,0.92),rgba(212,175,55,0.10))] px-5 py-5 shadow-[0_0_0_1px_rgba(212,175,55,0.08),0_18px_50px_rgba(0,0,0,0.45)]"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="font-cinema text-[var(--antique-gold)] uppercase tracking-[0.3em] text-[0.7rem] mb-2">
                Important Announcement
              </p>
              <p className="font-script text-[var(--ivory)] text-sm md:text-base leading-relaxed">
                The event has been postponed. The new date will be announced soon. Registrations are open now, so you can register today.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <span className="chip">Postponed</span>
              <span className="chip">Registrations Open</span>
              <span className="chip">Register Now</span>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="chip">Postponed</span>
          <span className="chip">Two Venues</span>
          <span className="chip">Three Acts</span>
          <span className="chip">Registrations Open</span>
        </div>
        
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 2.0 }}
          className="premium-card-soft rounded-2xl px-6 py-4 mb-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left w-full max-w-3xl"
        >
          {[
            { label: "Cooking", value: "12:30 PM", detail: "MBA Open Quadrangle" },
            { label: "Dance + Drama", value: "5:30 PM", detail: "Gallery Hall, BEC" },
            { label: "Registration", value: "Open Now", detail: "Register today" },
          ].map((item) => (
            <div key={item.label} className="sm:border-r sm:border-[rgba(212,175,55,0.12)] last:border-r-0 pr-0 sm:pr-4">
              <p className="font-script text-[var(--antique-gold-soft)] uppercase tracking-[0.25em] text-[0.65rem] mb-1">{item.label}</p>
              <p className="font-cinema text-[var(--ivory)] text-lg tracking-wide mb-1">{item.value}</p>
              <p className="font-script text-[var(--ivory-dim)] text-xs">{item.detail}</p>
            </div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 2.2 }}
          className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
        >
          <button
            onClick={() => document.querySelector("#register")?.scrollIntoView({ behavior: "smooth" })}
            className="engraved-btn font-cinema tracking-widest uppercase px-12 py-4 text-sm rounded-full"
          >
            Register Now
          </button>
          
          <button
            onClick={() => document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" })}
            className="group ghost-btn rounded-full font-script italic tracking-wider text-[var(--ivory-muted)] hover:text-[var(--antique-gold)] transition-colors px-12 py-4 flex items-center justify-center gap-3"
          >
            Read the Script
            <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
