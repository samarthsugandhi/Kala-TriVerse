"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState } from "react";

const ACTS = [
  {
    id: "classical",
    label: "Act I: Classical",
    subtitle: "Bharatanatyam · Kuchipudi · Kathak",
    desc: "The timeless art form that weaves mythology, rhythm, and devotion into every single movement.",
    criteria: [
      { title: "Footwork & Nritta", detail: "Precision of basic steps and taal accuracy." },
      { title: "Abhinaya", detail: "Emotive storytelling through facial expressions." },
      { title: "Laya", detail: "Correct beat adherence and synchronization." }
    ],
    symbol: "🪷",
  },
  {
    id: "western",
    label: "Act II: Western",
    subtitle: "Hip-Hop · Contemporary · Freestyle",
    desc: "High-energy modern dance that fuses athletic precision, modern creativity, and dynamic stage presence.",
    criteria: [
      { title: "Execution", detail: "Precision of moves and body control." },
      { title: "Coordination", detail: "Group sync, spacing, and formations." },
      { title: "Energy", detail: "Performance confidence and audience connection." }
    ],
    symbol: "⚡",
  },
  {
    id: "folk",
    label: "Act III: Janapada",
    subtitle: "Dollu Kunitha · Veeragase · Yakshagana",
    desc: "Rooted in the rich heritage of the soil — a powerful celebration of raw tradition and folk spirit.",
    criteria: [
      { title: "Authenticity", detail: "Faithful reflection of the region's tradition." },
      { title: "Music & Props", detail: "Use of proper folk instruments and attires." },
      { title: "Spirit", detail: "Natural, organic synchrony true to the form." }
    ],
    symbol: "🪘",
  },
  {
    id: "drama",
    label: "Act IV: Skit / Drama",
    subtitle: "Expression · Storytelling · Impact",
    desc: "Masks fall and truth emerges. Command the stage, direct your peers, and emote stories that linger long after the final curtain.",
    criteria: [
      { title: "Acting", detail: "Voice modulation, expressions, and body language." },
      { title: "Script", detail: "Originality, impact, and flow of the story." },
      { title: "Direction", detail: "Use of stage, props, and overall coordination." }
    ],
    symbol: "🎭",
  },
  {
    id: "food",
    label: "Act V: Cooking without fire",
    subtitle: "Flavor · Presentation · Innovation",
    desc: "Mastery without flame. Craft exquisite, cold-prepared culinary art with strict no-heat, vegetarian, hygiene, and time-bound standards.",
    criteria: [
      { title: "Taste & Flavor (40)", detail: "Overall palatability, seasoning balance, and texture." },
      { title: "Creativity & Innovation (20)", detail: "Originality of recipe and unique use of raw ingredients." },
      { title: "Presentation & Plating (20)", detail: "Visual appeal, color coordination, and neatness." },
      { title: "Hygiene & Cleanliness (10)", detail: "Maintenance of a clean workstation and safe handling." },
      { title: "Time Management (10)", detail: "Completion within 90 minutes and readiness for judges." }
    ],
    symbol: "👨‍🍳",
  },
];

export default function DanceRules() {
  const [active, setActive] = useState(ACTS[0].id);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const current = ACTS.find((a) => a.id === active)!;

  return (
    <section id="rules" className="py-32 px-4 relative flex justify-center">
      
      {/* Background soft stage spotlight */}
      <div className="absolute inset-0 stage-spotlight-maroon opacity-50 z-0 pointer-events-none" />

      <div className="max-w-5xl w-full relative z-10" ref={ref}>
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.5 }}
            className="font-cinema text-4xl text-[var(--ivory)] uppercase tracking-widest drop-shadow-lg mb-4"
          >
            The Director's Notes
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="w-24 h-[1px] bg-[var(--antique-gold)] mx-auto opacity-50"
          />
        </div>

        {/* Tab Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 mb-12"
        >
          {ACTS.map((act) => (
            <button
              key={act.id}
              onClick={() => setActive(act.id)}
              className="font-script relative px-6 py-2 uppercase tracking-[0.2em] text-sm transition-all duration-500"
              style={{
                color: active === act.id ? "var(--ivory)" : "var(--antique-gold-soft)",
              }}
            >
              {act.label}
              {active === act.id && (
                <motion.div
                  layoutId="activeAct"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-[var(--antique-gold)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Manuscript Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, filter: "blur(5px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(5px)", y: -10 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="bg-[#111] p-10 md:p-14 border border-[var(--antique-gold-dim)] relative overflow-hidden"
            style={{ boxShadow: "inset 0 0 50px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.4)" }}
          >
            {/* Watermark symbol overlay */}
            <div className="absolute -bottom-10 -right-10 text-[12rem] opacity-[0.03] grayscale pointer-events-none">
              {current.symbol}
            </div>

            <div className="flex flex-col items-center text-center relative z-10">
              <h3 className="font-cinema text-3xl text-[var(--ivory)] uppercase tracking-wider mb-2">
                {current.label.split(": ")[1]}
              </h3>
              <p className="font-script italic text-[var(--antique-gold-soft)] text-sm mb-8">
                {current.subtitle}
              </p>
              
              <p className="font-script text-[var(--ivory-muted)] text-base max-w-2xl leading-loose mb-12">
                {current.desc}
              </p>

              {[
                "classical",
                "western",
                "folk",
              ].includes(current.id) && (
                <p className="font-script italic text-[var(--antique-gold)] text-sm max-w-2xl leading-relaxed mb-10 border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.05)] px-4 py-3">
                  Guideline: For all dance categories (Act I, Act II, and Act III), the submitted performance track must be within a maximum duration of 4 minutes.
                </p>
              )}

              {current.id === "food" && (
                <div className="w-full max-w-4xl mb-12 text-left border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.05)] p-6 md:p-8 space-y-6">
                  <div>
                    <h4 className="font-cinema text-[var(--antique-gold)] text-sm tracking-[0.25em] uppercase mb-3">
                      Cooking Without Fire: Rules & Regulations
                    </h4>
                    <p className="font-script text-[var(--ivory-dim)] text-sm leading-relaxed">
                      Report 20 minutes early. Mandatory briefing happens 10 minutes before start. Judges' decision is final and binding.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="font-cinema text-[var(--ivory)] text-xs tracking-[0.18em] uppercase mb-2">1. General Guidelines</p>
                      <ul className="list-disc pl-5 space-y-1 font-script text-[var(--ivory-dim)] text-sm leading-relaxed">
                        <li>Team composition: Exactly 2 members per team.</li>
                        <li>Theme: Nutritious, delicious, and aesthetically pleasing dishes using raw or pre-prepared ingredients.</li>
                        <li>Time limit: 90 minutes (preparation, plating, and cleanup included).</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-cinema text-[var(--ivory)] text-xs tracking-[0.18em] uppercase mb-2">2. Prohibited Items (No-Heat Rule)</p>
                      <ul className="list-disc pl-5 space-y-1 font-script text-[var(--ivory-dim)] text-sm leading-relaxed">
                        <li>Gas stoves, induction cooktops, portable burners, microwaves, ovens, toasters, kettles, and blowtorches are prohibited.</li>
                        <li>Any heating device usage leads to immediate disqualification.</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-cinema text-[var(--ivory)] text-xs tracking-[0.18em] uppercase mb-2">3. Ingredients & Preparation</p>
                      <ul className="list-disc pl-5 space-y-1 font-script text-[var(--ivory-dim)] text-sm leading-relaxed">
                        <li>Strictly vegetarian only: no meat, poultry, fish, or eggs.</li>
                        <li>Final assembly and major preparation must be done on-site during competition hours.</li>
                        <li>Allowed pre-prepared items: pre-boiled potatoes, boiled pasta/corn, pre-washed/peeled vegetables.</li>
                        <li>Participants must bring all required ingredients.</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-cinema text-[var(--ivory)] text-xs tracking-[0.18em] uppercase mb-2">4. Equipment & Hygiene</p>
                      <ul className="list-disc pl-5 space-y-1 font-script text-[var(--ivory-dim)] text-sm leading-relaxed">
                        <li>Manual tools are encouraged (graters, manual choppers, whisks, mortar and pestle).</li>
                        <li>Only small low-power electric mixers/blenders are permitted.</li>
                        <li>Teams must bring cutlery, serving platters, and decorative elements.</li>
                        <li>Workstations must remain clean; poor disposal/cleanliness results in score deduction.</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-cinema text-[var(--ivory)] text-xs tracking-[0.18em] uppercase mb-2">5. Participant Instructions</p>
                      <ul className="list-disc pl-5 space-y-1 font-script text-[var(--ivory-dim)] text-sm leading-relaxed">
                        <li>Be ready to explain dish concept, ingredients, and nutritional value during judging.</li>
                        <li>Ensure ingredients are washed and safely stored prior to the event start.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Judgment Criteria */}
              <div className="w-full text-left">
                <p className="font-cinema text-[var(--antique-gold)] text-xs tracking-[0.3em] uppercase mb-6 text-center">
                  Judging Criteria
                </p>
                <div className={`grid gap-8 ${current.id === "food" ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-3"}`}>
                  {current.criteria.map((c, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
                      className="border-l border-[var(--royal-maroon)] pl-4"
                    >
                      <h4 className="font-cinema text-[var(--ivory)] text-sm tracking-widest uppercase mb-2">
                        {c.title}
                      </h4>
                      <p className="font-script text-[var(--ivory-dim)] text-sm leading-relaxed">
                        {c.detail}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
