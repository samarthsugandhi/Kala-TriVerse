"use client";

import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";

const InstagramIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
  </svg>
);

export default function Contact() {
  return (
    <section id="contact" className="section-shell relative flex justify-center bg-[var(--bg-charcoal)]">
      
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
          <p className="section-kicker mb-4">Direct Lines</p>
          <h2 className="section-title text-4xl text-[var(--ivory)] mb-4">
            Meet The Directors
          </h2>
          <p className="section-copy font-script italic text-sm tracking-wide mb-16 max-w-2xl mx-auto">
            For inquiries regarding the grand stage, contact our coordinators.
          </p>

          <div className="grid lg:grid-cols-2 gap-8 xl:gap-10 text-left">
            {/* Student Coordinators */}
            <div className="premium-card rounded-[1.75rem] p-8 md:p-10 flex flex-col items-center">
              <h3 className="font-cinema text-[var(--antique-gold)] text-xs tracking-[0.3em] uppercase mb-8 border-b border-[rgba(212,175,55,0.2)] pb-2 w-full text-center">Student Execution</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-4 mb-8">
                <div className="premium-card-soft rounded-2xl p-4 text-center">
                  <p className="font-cinema text-[var(--ivory)] text-lg mb-1 tracking-wider">Vinayak</p>
                  <a href="tel:6361767094" className="font-script text-[var(--antique-gold-soft)] hover:text-[var(--antique-gold)] italic flex items-center gap-2 justify-center"><Phone size={14}/> 63617 67094</a>
                </div>
                <div className="premium-card-soft rounded-2xl p-4 text-center">
                  <p className="font-cinema text-[var(--ivory)] text-lg mb-1 tracking-wider">Samarth</p>
                  <a href="tel:7353682322" className="font-script text-[var(--antique-gold-soft)] hover:text-[var(--antique-gold)] italic flex items-center gap-2 justify-center"><Phone size={14}/> 73536 82322</a>
                </div>
                <div className="premium-card-soft rounded-2xl p-4 text-center">
                  <p className="font-cinema text-[var(--ivory)] text-lg mb-1 tracking-wider">Niharika</p>
                  <a href="tel:9663992104" className="font-script text-[var(--antique-gold-soft)] hover:text-[var(--antique-gold)] italic flex items-center gap-2 justify-center"><Phone size={14}/> 96639 92104</a>
                </div>
                <div className="premium-card-soft rounded-2xl p-4 text-center">
                  <p className="font-cinema text-[var(--ivory)] text-lg mb-1 tracking-wider">Sneha Y</p>
                  <a href="tel:7899057706" className="font-script text-[var(--antique-gold-soft)] hover:text-[var(--antique-gold)] italic flex items-center gap-2 justify-center"><Phone size={14}/> 78990 57706</a>
                </div>
              </div>

              {/* Direct Digital Lines */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-6 border-t border-[rgba(212,175,55,0.05)] w-full justify-center items-center">
                <a href="mailto:iserise12@gmail.com" className="group flex items-center gap-2 text-[var(--ivory-muted)] hover:text-[var(--antique-gold)] transition-colors">
                  <Mail size={16} className="text-[var(--royal-maroon)] group-hover:text-[var(--antique-gold)] transition-colors"/> 
                  <span className="font-script italic text-sm">iserise12@gmail.com</span>
                </a>
                <a href="https://www.instagram.com/bec_ise_rise" target="_blank" rel="noreferrer" className="group flex items-center gap-2 text-[var(--ivory-muted)] hover:text-[var(--antique-gold)] transition-colors">
                  <InstagramIcon size={16} className="text-[var(--royal-maroon)] group-hover:text-[var(--antique-gold)] transition-colors" />
                  <span className="font-script italic text-sm">@bec_ise_rise</span>
                </a>
              </div>
            </div>

            {/* Faculty Coordinators */}
            <div className="premium-card rounded-[1.75rem] p-8 md:p-10 flex flex-col items-center">
              <h3 className="font-cinema text-[var(--antique-gold)] text-xs tracking-[0.3em] uppercase mb-8 border-b border-[rgba(212,175,55,0.2)] pb-2 w-full text-center">Faculty Visionaries</h3>
              
              <div className="flex flex-col gap-4 w-full items-start">
                <div className="premium-card-soft rounded-2xl text-left border-l-2 border-[var(--royal-maroon)] pl-4 py-4 pr-4 w-full">
                  <p className="font-cinema text-[var(--ivory)] text-lg tracking-wider">Dr. L. B. Bhajantri</p>
                  <p className="font-script text-[var(--antique-gold-soft)] italic text-xs tracking-widest uppercase">Head of Department, ISE</p>
                </div>
                <div className="premium-card-soft rounded-2xl text-left border-l-2 border-[rgba(212,175,55,0.4)] pl-4 py-4 pr-4 w-full">
                  <p className="font-cinema text-[var(--ivory)] text-lg tracking-wider">Prof. G. B. Shettar</p>
                  <p className="font-script text-[var(--antique-gold-soft)] italic text-xs tracking-widest uppercase">Coordinator, RISE Association</p>
                </div>
                <div className="premium-card-soft rounded-2xl text-left border-l-2 border-[rgba(212,175,55,0.4)] pl-4 py-4 pr-4 w-full">
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
