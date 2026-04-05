"use client";

import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-32 px-4 flex justify-center relative bg-[var(--bg-charcoal)]">
      
      {/* Soft spotlight behind contact cards */}
      <div className="absolute inset-0 stage-spotlight opacity-40 z-0 pointer-events-none" />

      <div className="max-w-6xl w-full relative z-10 text-center">
        
        {/* Cultural Divider top */}
        <div className="flex items-center justify-center gap-4 mb-16 opacity-40">
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-[var(--antique-gold)]" />
          <div className="w-2 h-2 rotate-45 border border-[var(--antique-gold)] bg-[var(--royal-maroon)]" />
          <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-[var(--antique-gold)]" />
        </div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-50px" }}
           transition={{ duration: 1.5 }}
        >
          <h2 className="font-cinema text-4xl text-[var(--ivory)] uppercase tracking-widest mb-4">
            Meet The Directors
          </h2>
          <p className="font-script text-[var(--antique-gold-soft)] italic text-sm tracking-wide mb-16">
            For inquiries regarding the grand stage, contact our coordinators.
          </p>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Student Coordinators */}
            <div className="bg-[#111] border border-[rgba(212,175,55,0.1)] p-10 flex flex-col items-center">
              <h3 className="font-cinema text-[var(--antique-gold)] text-xs tracking-[0.3em] uppercase mb-8 border-b border-[rgba(212,175,55,0.2)] pb-2 w-full">Student Execution</h3>
              
              <div className="flex flex-col sm:flex-row w-full justify-around gap-6 sm:gap-0 mb-8">
                <div className="text-center">
                  <p className="font-cinema text-[var(--ivory)] text-lg mb-1 tracking-wider">Samarth Sugandhi</p>
                  <a href="tel:7353682322" className="font-script text-[var(--antique-gold-soft)] hover:text-[var(--antique-gold)] italic flex items-center gap-2 justify-center"><Phone size={14}/> 7353682322</a>
                </div>
                <div className="text-center">
                  <p className="font-cinema text-[var(--ivory)] text-lg mb-1 tracking-wider">Vinayak Killedar</p>
                  <a href="tel:9901357911" className="font-script text-[var(--antique-gold-soft)] hover:text-[var(--antique-gold)] italic flex items-center gap-2 justify-center"><Phone size={14}/> 9901357911</a>
                </div>
              </div>

              {/* Direct Digital Lines */}
              <div className="flex gap-8 mt-4 pt-6 border-t border-[rgba(212,175,55,0.05)] w-full justify-center">
                <a href="mailto:iserise12@gmail.com" className="group flex items-center gap-2 text-[var(--ivory-muted)] hover:text-[var(--antique-gold)] transition-colors">
                  <Mail size={16} className="text-[var(--royal-maroon)] group-hover:text-[var(--antique-gold)] transition-colors"/> 
                  <span className="font-script italic text-sm">iserise12@gmail.com</span>
                </a>
                <a href="https://www.instagram.com/bec_ise_rise" target="_blank" rel="noreferrer" className="group flex items-center gap-2 text-[var(--ivory-muted)] hover:text-[var(--antique-gold)] transition-colors">
                  <span className="text-[var(--royal-maroon)] group-hover:text-[var(--antique-gold)] transition-colors">📸</span> 
                  <span className="font-script italic text-sm">@bec_ise_rise</span>
                </a>
              </div>
            </div>

            {/* Faculty Coordinators */}
            <div className="bg-[#111] border border-[rgba(212,175,55,0.1)] p-10 flex flex-col items-center">
              <h3 className="font-cinema text-[var(--antique-gold)] text-xs tracking-[0.3em] uppercase mb-8 border-b border-[rgba(212,175,55,0.2)] pb-2 w-full">Faculty Visionaries</h3>
              
              <div className="flex flex-col gap-6 w-full items-start pl-4">
                <div className="text-left border-l-2 border-[var(--royal-maroon)] pl-4">
                  <p className="font-cinema text-[var(--ivory)] text-lg tracking-wider">Dr. L. B. Bhajantri</p>
                  <p className="font-script text-[var(--antique-gold-soft)] italic text-xs tracking-widest uppercase">Head of Department, ISE</p>
                </div>
                <div className="text-left border-l-2 border-[rgba(212,175,55,0.4)] pl-4">
                  <p className="font-cinema text-[var(--ivory)] text-lg tracking-wider">Prof. G. B. Shettar</p>
                  <p className="font-script text-[var(--antique-gold-soft)] italic text-xs tracking-widest uppercase">Coordinator, RISE Association</p>
                </div>
                <div className="text-left border-l-2 border-[rgba(212,175,55,0.4)] pl-4">
                  <p className="font-cinema text-[var(--ivory)] text-lg tracking-wider">Prof. S. S. Hiremath</p>
                  <p className="font-script text-[var(--antique-gold-soft)] italic text-xs tracking-widest uppercase">Coordinator, RISE Association</p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
