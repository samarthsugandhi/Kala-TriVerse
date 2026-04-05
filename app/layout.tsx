import type { Metadata } from "next";
import { Playfair_Display, Lora } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-cinema",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"]
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-script",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"]
});

import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "KALA-TriVerse :Fusion Fest",
  description:
    "A cultural and creative festival celebrating rhythm, acting, and innovation through dance, drama, and culinary expression.",
  keywords: [
    "KALA-TriVerse", "Fusion Fest", "Cultural Festival",
    "Dance", "Drama", "Food Without Fire", "ISE", "RISE",
  ],
  openGraph: {
    title: "KALA-TriVerse :Fusion Fest",
    description: "A cultural experience unfolding on a digital stage.",
    type: "website",
  },
  robots: "index, follow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0F0F0F" />
      </head>
      <body className={`${playfair.variable} ${lora.variable} font-script antialiased bg-[#0F0F0F]`}>
        <CustomCursor />
        {/* Subtle vignette border around the entire screen to enhance the stage feel */}
        <div className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]" />
        {children}
      </body>
    </html>
  );
}
