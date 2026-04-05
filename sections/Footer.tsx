"use client";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="py-12 bg-[#050505] border-t border-[rgba(212,175,55,0.1)] flex flex-col items-center justify-center text-center">
      
      {/* Builder Credit */}
      <p className="font-cinema text-[var(--antique-gold-soft)] text-[0.65rem] tracking-[0.2em] uppercase mb-4">
        BUILT BY SAMARTH SUGANDHI — MEDIA, RISE ASSOCIATION, BEC.
      </p>

      {/* Decorative center element */}
      <div className="w-1.5 h-1.5 rotate-45 bg-[var(--antique-gold-soft)] mb-6 opacity-50" />

      {/* Copyright */}
      <p className="font-cinema text-[var(--ivory-dim)] text-[0.6rem] uppercase tracking-[0.3em]">
        © {year} KALA-TriVerse. All Acts Reserved.
      </p>
    </footer>
  );
}
