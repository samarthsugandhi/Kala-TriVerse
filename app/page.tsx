"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";
import Hero from "@/sections/Hero";
import Results from "@/sections/Results";
import About from "@/sections/About";
import Events from "@/sections/Events";
import DanceRules from "@/sections/DanceRules";
import Schedule from "@/sections/Schedule";
import Registration from "@/sections/Registration";
import Contact from "@/sections/Contact";
import Footer from "@/sections/Footer";

export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <main className="min-h-screen page-frame" style={{ background: "var(--bg-charcoal)" }}>
          <Navbar />
          <Hero />
          <Results />
          <About />
          <Events />
          <DanceRules />
          <Schedule />
          <Registration />
          <Contact />
          <Footer />
        </main>
      )}
    </>
  );
}
