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
      title: "Dance Competition",
      subtitle: "The Canvas of Motion",
      desc: "Flowing rhythms cross three traditions: the divine geometry of Classical, the electric pulse of Western, and the earthy soul of Janapada (Folk).",
      cardTitle: "Dance Competition - Quick Rules",
      cardItems: [
        "Covers Classical, Western, and Janapada (Folk) categories.",
        "Submitted performance track must stay within 4 minutes.",
        "Keep costumes, formations, and stage movement category-appropriate.",
      ],
      symbol: "🪷",
      art: "bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.1),transparent_70%)]",
      delay: 0.2
    },
    {
      id: "drama",
      title: "Skit/Drama",
      subtitle: "The Theatre of Life",
      desc: "Masks fall and truth emerges. Command the stage, direct your peers, and emote stories that linger long after the final curtain.",
      cardTitle: "Skit/Drama - Quick Rules",
      cardItems: [
        "Focus on expression, storytelling, and overall impact.",
        "Coordinate props, blocking, and stage movement carefully.",
        "Keep the performance neat, engaging, and time-disciplined.",
      ],
      symbol: "🎭",
      art: "bg-[radial-gradient(circle_at_top_right,rgba(128,0,0,0.1),transparent_70%)]",
      delay: 0.4
    },
    {
      id: "food",
      title: "Cooking without fire",
      subtitle: "Culinary Alchemy",
      desc: "Mastery without flame. Craft exquisite, cold-prepared culinary art where flavor, plating, and innovation take center stage.",
      cardTitle: "Cooking Without Fire - Quick Rules",
      cardItems: [
        "Team size: exactly 2 members.",
        "Strictly vegetarian only; no eggs/meat/fish.",
        "No heat appliances; violation means disqualification.",
        "Time limit: 90 minutes including cleanup.",
      ],
      symbol: "👨‍🍳",
      art: "bg-[radial-gradient(circle_at_top_right,rgba(184,115,51,0.1),transparent_70%)]",
      delay: 0.6
    }
  ];

  return (
    <section id="events" className="section-shell relative overflow-hidden">
      <div className="max-w-6xl mx-auto" ref={ref}>
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1 }}
            className="section-kicker mb-4"
          >
            The Performances
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="section-title text-4xl md:text-5xl drop-shadow-xl"
          >
            Our Three Acts
          </motion.h2>
          <p className="section-copy font-script text-sm md:text-base max-w-2xl mx-auto mt-5">
            Three carefully framed experiences designed for movement, expression, and plated creativity.
          </p>
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
              <div className={`framed-card h-full p-8 md:p-10 flex flex-col justify-between rounded-[1.75rem] ${ev.art}`}>
                
                {/* Artwork Centerpiece Icon */}
                <div className="w-full flex justify-center mb-10 pt-4">
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: 3 }}
                    transition={{ type: "spring", stiffness: 220, damping: 16 }}
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
                  
                  <p className="font-script text-[var(--ivory-muted)] text-sm leading-loose max-w-[34ch] mx-auto">
                    {ev.desc}
                  </p>

                  {(ev.id === "dance" || ev.id === "drama" || ev.id === "food") && (
                    <div className="mt-5 text-left bg-[rgba(212,175,55,0.05)] border border-[rgba(212,175,55,0.2)] px-4 py-3">
                      <p className="font-cinema text-[var(--antique-gold)] text-[10px] tracking-[0.2em] uppercase mb-2 text-center">
                        {ev.cardTitle}
                      </p>
                      <ul className="list-disc pl-4 space-y-1 font-script text-[var(--ivory-dim)] text-xs leading-relaxed">
                        {ev.cardItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Prize Info */}
                  <div className="mt-4 inline-block bg-[rgba(212,175,55,0.05)] border border-[rgba(212,175,55,0.2)] px-4 py-2">
                    <p className="font-cinema text-[var(--antique-gold)] text-xs tracking-widest uppercase mb-1">Prize Pool</p>
                    <p className="font-script text-[var(--ivory)] text-xs">
                      1st: ₹2500 <span className="mx-2 text-[var(--antique-gold-soft)]">|</span> 2nd: ₹1500
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <motion.div
                  className="mt-8 pt-6 border-t border-[var(--antique-gold-dim)] flex justify-center w-full"
                  whileHover={{ y: -2 }}
                >
                  <button
                    onClick={() => document.querySelector('#rules')?.scrollIntoView({ behavior: 'smooth' })}
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
