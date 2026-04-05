"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { collection, onSnapshot, doc, query, where } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

interface Winner {
  id: string;
  teamName: string;
  act: string;
  leadName: string;
  placement: string;
}

const ACT_LABELS: Record<string, string> = {
  classical: "Act I: Classical",
  western: "Act II: Western",
  folk: "Act III: Janapada",
  drama: "Act IV: Drama & Skit",
  food: "Act V: Culinary Arts"
};

export default function Results() {
  const [isAnnounced, setIsAnnounced] = useState(false);
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    // Listen to Settings
    const unsubSettings = onSnapshot(doc(db, "settings", "general"), (d) => {
      if (d.exists()) {
        setIsAnnounced(d.data().isAwardsAnnounced ?? false);
      }
    });

    // Listen to Placements
    const q = query(collection(db, "registrations"), where("placement", "!=", ""));
    const unsubWins = onSnapshot(q, (snap) => {
      const data: Winner[] = [];
      snap.forEach(doc => {
        const d = doc.data();
        if (d.placement) {
          data.push({ id: doc.id, teamName: d.teamName, act: d.act, leadName: d.leadName, placement: d.placement });
        }
      });
      setWinners(data);
    });

    return () => { unsubSettings(); unsubWins(); };
  }, []);

  if (!isAnnounced) return null;

  // Group by Act
  const grouped = winners.reduce((acc, curr) => {
    if (!acc[curr.act]) acc[curr.act] = [];
    acc[curr.act].push(curr);
    return acc;
  }, {} as Record<string, Winner[]>);

  // Sort logic for placing Winner > 1st Runner Up > 2nd Runner Up
  const rankWeight: Record<string, number> = { "Winner": 1, "1st Runner Up": 2, "2nd Runner Up": 3 };

  return (
    <section className="py-24 px-4 bg-[var(--bg-charcoal)] relative overflow-hidden flex justify-center">
      {/* Golden spotlight radial gradient */}
      <div className="absolute top-0 inset-x-0 h-full w-full bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.1)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-6xl w-full relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="text-center mb-20"
        >
          <div className="text-[var(--antique-gold)] text-4xl mb-4">🏆</div>
          <h2 className="font-cinema text-4xl md:text-6xl text-gold-gradient tracking-[0.2em] uppercase uppercase mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            The Champions
          </h2>
          <p className="font-script text-[var(--antique-gold-soft)] italic tracking-widest text-sm uppercase">KALA-TriVerse Official Results</p>
          <div className="flex justify-center mt-6">
            <div className="h-[1px] w-64 bg-gradient-to-r from-transparent via-[var(--antique-gold)] to-transparent opacity-50" />
          </div>
        </motion.div>

        <div className="flex flex-col gap-16">
          {Object.entries(grouped).map(([actKey, actsWins], idx) => {
            const sortedActWins = actsWins.sort((a, b) => (rankWeight[a.placement] || 99) - (rankWeight[b.placement] || 99));

            return (
              <motion.div 
                key={actKey}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: idx * 0.2 }}
                className="bg-[#0A0A0A] border border-[rgba(212,175,55,0.2)] p-8 md:p-12 relative shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--antique-gold)] text-black px-6 py-1 font-cinema tracking-widest uppercase text-xs font-bold shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                  {ACT_LABELS[actKey] || actKey}
                </div>

                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                  {sortedActWins.map((w) => (
                    <div key={w.id} className={`flex flex-col items-center text-center p-6 border ${w.placement === "Winner" ? "border-[var(--antique-gold)] bg-[rgba(212,175,55,0.05)] shadow-[inset_0_0_20px_rgba(212,175,55,0.1)] scale-105" : "border-[rgba(212,175,55,0.1)] bg-black"}`}>
                      <span className={`font-cinema tracking-[0.2em] uppercase text-xs mb-4 pb-2 border-b w-full ${w.placement === "Winner" ? "text-[var(--antique-gold)] border-[var(--antique-gold)] font-bold" : "text-[var(--antique-gold-soft)] border-[rgba(212,175,55,0.2)]"}`}>
                        {w.placement}
                      </span>
                      <h4 className="font-cinema text-2xl text-[var(--ivory)] uppercase tracking-wide mb-2">{w.teamName}</h4>
                      <p className="font-script text-[var(--ivory-muted)] italic text-sm">Led by {w.leadName}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {winners.length === 0 && (
            <div className="text-center italic text-[var(--antique-gold-dim)] font-script">
              Evaluating the scripts... Check back shortly.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
