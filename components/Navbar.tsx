"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Story", href: "#about" },
  { label: "Performances", href: "#events" },
  { label: "Acts", href: "#rules" },
  { label: "Schedule", href: "#schedule" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ["rgba(15, 15, 15, 0)", "rgba(15, 15, 15, 0.95)"]);
  const borderBottom = useTransform(scrollY, [0, 80], ["1px solid rgba(212, 175, 55, 0)", "1px solid rgba(212, 175, 55, 0.15)"]);

  const handleNav = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.nav
        style={{ backgroundColor: bg, borderBottom }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out backdrop-blur-xl"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-4">
          <div className="nav-pill rounded-full px-5 md:px-6 py-3 flex items-center justify-between gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
            
            {/* Logo area */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="flex flex-col cursor-pointer shrink-0"
              onClick={() => handleNav("#home")}
            >
              <span className="font-cinema text-xl md:text-2xl font-bold tracking-widest text-gold-gradient drop-shadow-md">
                KALA
              </span>
              <span className="font-script text-[0.55rem] tracking-[0.32em] text-[var(--ivory-dim)] uppercase whitespace-nowrap">
                TriVerse <span className="text-[var(--royal-maroon)] px-1">|</span> ISE
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="hidden md:flex items-center gap-8 lg:gap-10"
            >
              {links.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNav(link.href)}
                    className="font-script text-[0.8rem] tracking-widest text-[var(--ivory-muted)] hover:text-[var(--antique-gold)] transition-colors duration-300 uppercase relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-2 left-1/2 w-0 h-[1px] bg-[var(--antique-gold)] transition-all duration-500 ease-in-out group-hover:w-full group-hover:left-0 opacity-50" />
                  </button>
                </li>
              ))}
              <li className="ml-4">
                <button
                  onClick={() => handleNav("#register")}
                  className="font-cinema text-[0.75rem] tracking-widest uppercase px-5 py-2.5 engraved-btn rounded-full focus:outline-none"
                >
                  Join Stage
                </button>
              </li>
            </motion.ul>

            {/* Mobile Hamburger Menu */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="md:hidden text-[var(--antique-gold)] z-50 p-2"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer (Cinematic Fade In) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-[rgba(15,15,15,0.98)] flex items-center justify-center border-b border-[var(--antique-gold-dim)] backdrop-blur-2xl"
          >
            {/* Ambient Spotlight inside mobile menu */}
            <div className="absolute inset-0 stage-spotlight opacity-30 pointer-events-none" />
            
            <ul className="flex flex-col gap-8 text-center px-8 py-10 premium-card rounded-3xl min-w-[min(88vw,420px)] relative z-10">
              {links.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                >
                  <button
                    onClick={() => handleNav(link.href)}
                    className="font-cinema text-2xl text-[var(--ivory)] hover:text-[var(--antique-gold)] tracking-widest uppercase"
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-6"
              >
                <button
                  onClick={() => handleNav("#register")}
                  className="font-script italic text-xl text-[var(--royal-maroon)] hover:text-[var(--antique-gold)] transition-colors border-b border-transparent hover:border-[var(--antique-gold)] pb-1"
                >
                  Register The Fest
                </button>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
