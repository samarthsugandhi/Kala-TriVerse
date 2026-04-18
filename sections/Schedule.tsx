"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const schedule = [
  {
    time: "5:30 PM",
    act: "Act I",
    title: "Aarambha",
    desc: "The audience gathers. Distribution of event programs and seating.",
  },
  {
    time: "6:00 PM",
    act: "Act II",
    title: "Deepajwalan",
    desc: "Inauguration and lighting of the lamp by esteemed faculty, opening the stage.",
  },
  {
    time: "6:30 PM",
    act: "Act III",
    title: "Pradarshana",
    desc: "The core performances begin. Dance, Drama, and Culinary artistry take the spotlight.",
  },
  {
    time: "8:15 PM",
    act: "Finale",
    title: "Samaropa",
    desc: "The closing act. Valedictory, awards ceremony, and final curtain call.",
  },
];

export default function Schedule() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="schedule" className="section-shell-tight px-4 relative flex justify-center bg-[#0C0C0C]">
      
      {/* Background script texture overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--antique-gold) 0, transparent 1px, transparent 100px, var(--antique-gold) 100px)" }} />

      <div className="max-w-3xl w-full relative z-10" ref={ref}>
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1 }}
            className="section-kicker mb-4"
          >
            The Evening's Program
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="section-title text-4xl drop-shadow-xl"
          >
            Order of Events
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={inView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="w-32 h-[1px] bg-[var(--antique-gold)] mx-auto mt-8 opacity-40"
          />
        </div>

        {/* Elegant Timeline */}
        <div className="relative pl-8 md:pl-0">
          
          {/* Vertical threading line (Mobile only left, Desktop center) */}
          <div className="absolute left-[39px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[var(--antique-gold-soft)] to-transparent opacity-60" />

          {schedule.map((item, i) => {
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1.2, delay: 0.2 + i * 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`relative flex md:justify-between items-center w-full mb-16 last:mb-0 ${
                  isEven ? "md:flex-row-reverse" : "md:flex-row"
                }`}
              >
                {/* Node Dot on Timeline */}
                <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full border border-[var(--antique-gold)] bg-[#0C0C0C] -translate-x-[7px] md:-translate-x-1/2 z-10" />

                {/* Empty Space for opposing side in desktop */}
                <div className="hidden md:block w-5/12" />

                {/* Content Card */}
                <div className={`premium-card rounded-[1.5rem] w-full md:w-5/12 ml-8 md:ml-0 px-6 py-6 ${isEven ? "md:text-right" : "md:text-left"}`}>
                  
                  <p className="font-script italic text-[var(--antique-gold)] text-sm tracking-widest mb-1">
                    {item.act}
                  </p>
                  
                  <h3 className="font-cinema text-2xl text-[var(--ivory)] uppercase tracking-wider mb-2">
                    {item.title}
                  </h3>
                  
                  <span className="inline-block py-1 px-3 border border-[rgba(212,175,55,0.3)] bg-[rgba(128,0,0,0.1)] font-cinema text-[0.65rem] text-[var(--ivory-dim)] uppercase tracking-[0.2em] mb-4 rounded-full">
                    {item.time}
                  </span>
                  
                  <p className="font-script text-[var(--ivory-muted)] text-sm leading-loose">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
