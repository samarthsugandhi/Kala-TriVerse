"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

export default function Events() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const events = [
    {
      id: "dance",
      title: "Nritya",
      subtitle: "The Canvas of Motion",
      desc: "Flowing rhythms cross three traditions: the divine geometry of Classical, the electric pulse of Western, and the earthy soul of Janapada (Folk).",
      symbol: "🪷",
      art: "bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.1),transparent_70%)]",
      delay: 0.2
    },
    {
      id: "drama",
      title: "Natya",
      subtitle: "The Theatre of Life",
      desc: "Masks fall and truth emerges. Command the stage, direct your peers, and emote stories that linger long after the final curtain.",
      symbol: "🎭",
      art: "bg-[radial-gradient(circle_at_top_right,rgba(128,0,0,0.1),transparent_70%)]",
      delay: 0.4
    },
    {
      id: "food",
      title: "Paka",
      subtitle: "Culinary Alchemy",
      desc: "Mastery without flame. Craft exquisite, cold-prepared culinary art where flavor, plating, and innovation take center stage.",
      symbol: "🏺",
      art: "bg-[radial-gradient(circle_at_top_right,rgba(184,115,51,0.1),transparent_70%)]",
      delay: 0.6
    }
  ];

  return (
    <section id="events" className="py-32 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto" ref={ref}>
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1 }}
            className="font-script text-[var(--antique-gold)] text-sm tracking-[0.4em] uppercase mb-4"
          >
            The Performances
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="font-cinema text-4xl md:text-5xl text-[var(--ivory)] tracking-wide drop-shadow-xl"
          >
            Our Three Acts
          </motion.h2>
        </div>

        {/* Framed Artworks Grid */}
        <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
          {events.map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.2, delay: ev.delay, ease: [0.22, 1, 0.36, 1] }}
              className="group relative"
            >
              {/* Outer Frame Glow on Hover */}
              <div className="absolute -inset-1 bg-[var(--antique-gold)] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />
              
              {/* Card Body - 'Framed Artwork' */}
              <div className={`framed-card h-full p-8 md:p-10 flex flex-col justify-between ${ev.art}`}>
                
                {/* Artwork Centerpiece Icon */}
                <div className="w-full flex justify-center mb-10 pt-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                    className="text-6xl filter drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] opacity-80"
                  >
                    {ev.symbol}
                  </motion.div>
                </div>

                <div className="text-center relative z-10">
                  <h3 className="font-cinema text-3xl text-[var(--ivory)] mb-2 tracking-wide uppercase">
                    {ev.title}
                  </h3>
                  <p className="font-script italic text-[var(--antique-gold)] text-sm mb-6">
                    {ev.subtitle}
                  </p>
                  
                  {/* Miniature divider */}
                  <div className="w-12 h-[1px] bg-[var(--antique-gold-soft)] mx-auto mb-6 opacity-30" />
                  
                  <p className="font-script text-[var(--ivory-muted)] text-sm leading-loose">
                    {ev.desc}
                  </p>
                </div>

                {/* Footer Action */}
                <motion.div
                  className="mt-8 pt-6 border-t border-[var(--antique-gold-dim)] flex justify-center w-full"
                  whileHover={{ y: -2 }}
                >
                  <button
                    onClick={() => document.querySelector(ev.id === 'dance' ? '#rules' : '#about')?.scrollIntoView({ behavior: 'smooth' })}
                    className="font-script italic text-xs text-[var(--antique-gold-soft)] hover:text-[var(--ivory)] flex items-center gap-2 transition-colors uppercase tracking-[0.2em]"
                  >
                    View Details <ArrowRight size={14} />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
