"use client";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="section-shell-tight bg-[#050505] border-t border-[rgba(212,175,55,0.1)] flex flex-col items-center justify-center text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30 stage-spotlight" />
      
      {/* Builder Credit */}
      <p className="font-cinema text-[var(--antique-gold-soft)] text-[0.65rem] tracking-[0.2em] uppercase mb-4 relative z-10">
        BUILT BY SAMARTH SUGANDHI — MEDIA, RISE ASSOCIATION, BEC.
      </p>

      {/* Decorative center element */}
      <div className="w-1.5 h-1.5 rotate-45 bg-[var(--antique-gold-soft)] mb-6 opacity-50 relative z-10" />

      {/* Copyright */}
      <p className="font-cinema text-[var(--ivory-dim)] text-[0.6rem] uppercase tracking-[0.3em] relative z-10">
        © {year} KALA-TriVerse. All Acts Reserved.
      </p>
    </footer>
  );
}
