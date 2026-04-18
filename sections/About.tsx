"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BookOpen, Sparkles, Feather } from "lucide-react";

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-32 px-4 relative flex justify-center">
      
      {/* Script / Program Sheet Container */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-4xl w-full"
      >
        {/* Background paper texture simulated with off-white/ivory tint over charcoal */}
        <div className="absolute inset-0 bg-[#161412] shadow-2xl z-0" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"noiseFilter\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23noiseFilter)\" opacity=\"0.03\"/></svg>')", mixBlendMode: "overlay" }} />
        
        {/* Outer Frame */}
        <div className="absolute inset-4 border border-[var(--antique-gold-dim)] pointer-events-none z-10" />
        <div className="absolute inset-6 border border-[var(--antique-gold-soft)] pointer-events-none z-10 opacity-30" />

        <div className="relative z-20 p-12 md:p-20 flex flex-col items-center text-center">
          
          <BookOpen strokeWidth={1} size={40} className="text-[var(--antique-gold)] mb-6 opacity-80" />
          
          <p className="font-script italic text-[var(--antique-gold-soft)] text-sm tracking-[0.3em] uppercase mb-4">
            The Prologue
          </p>

          <h2 className="font-cinema text-3xl md:text-5xl text-[var(--ivory)] font-bold tracking-wide mb-10 leading-tight drop-shadow-md">
            A Tale of Rhythm, <br />
            <span className="text-gold-gradient italic font-script font-normal">Drama &amp; Artistry</span>
          </h2>

          {/* Ornamental Divider */}
          <div className="flex items-center gap-4 mb-10 opacity-60">
            <div className="h-[1px] w-16 bg-[var(--antique-gold)] opacity-50" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[var(--royal-maroon)]" />
            <div className="w-2 h-2 rotate-45 border border-[var(--antique-gold)] bg-transparent" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[var(--royal-maroon)]" />
            <div className="h-[1px] w-16 bg-[var(--antique-gold)] opacity-50" />
          </div>

          <div className="font-script text-[var(--ivory-muted)] text-base md:text-lg max-w-2xl leading-loose flex flex-col gap-6">
            <p>
              <span className="text-2xl font-cinema text-[var(--antique-gold)] mr-1">K</span>
              ALA-TriVerse isn't just a festival; it is a meticulously crafted stage where tradition breathes freely alongside modern expression. Conceived by the <strong className="text-[var(--ivory)] font-normal">Department of Information Science and Engineering</strong> alongside RISE, it serves as a canvas for the extraordinary.
            </p>
            <p>
              Here, dancers paint stories with their footwork, actors weave profound narratives through silence and speech, and culinary minds sculpt masterpieces without the touch of flame. 
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 w-full max-w-3xl border-t border-[rgba(212,175,55,0.15)] pt-12">
            {[
              { icon: <Sparkles size={18}/>, label: "Acts", value: "3" },
              { icon: <Feather size={18}/>, label: "Genres", value: "3+" },
              { icon: <BookOpen size={18}/>, label: "Dates", value: "22 Apr" },
              { icon: <Sparkles size={18}/>, label: "Time", value: "12:30 & 5:30" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1 + i * 0.2, duration: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="text-[var(--royal-maroon)] mb-1 opacity-80">{stat.icon}</div>
                <span className="font-cinema text-3xl text-[var(--ivory)]">{stat.value}</span>
                <span className="font-script text-[0.6rem] uppercase tracking-[0.2em] text-[var(--antique-gold-soft)]">{stat.label}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center border border-[rgba(212,175,55,0.15)] bg-[rgba(212,175,55,0.02)] p-6 md:p-8 w-full max-w-3xl">
            <h4 className="font-cinema text-[var(--antique-gold)] text-lg uppercase tracking-wider mb-6 border-b border-[rgba(212,175,55,0.2)] pb-2 inline-block">Event Schedule &amp; Venues</h4>
            <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 text-left">
              <div>
                <p className="font-cinema text-[var(--ivory)] text-md tracking-wider mb-1">22nd April 2026</p>
                <p className="font-script text-[var(--antique-gold-soft)] text-sm mb-2">12:30 PM</p>
                <p className="font-script text-[var(--ivory-muted)] text-sm mb-1">📍 MBA Open Quadrangle</p>
                <p className="font-script text-[var(--ivory-dim)] text-xs mt-1 italic">Event: Cooking without fire</p>
              </div>
              <div className="hidden md:block w-[1px] bg-[rgba(212,175,55,0.2)]"></div>
              <div>
                <p className="font-cinema text-[var(--ivory)] text-md tracking-wider mb-1">22nd April 2026</p>
                <p className="font-script text-[var(--antique-gold-soft)] text-sm mb-2">5:30 PM</p>
                <p className="font-script text-[var(--ivory-muted)] text-sm mb-1">📍 Gallery Hall, BEC</p>
                <p className="font-script text-[var(--ivory-dim)] text-xs mt-1 italic">Events: Dance Competition, Skit/Drama</p>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
}
