"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  "/projects/courtyard-house/ext-back-dawn-close.jpg",
  "/projects/courtyard-house/ext-courtyard.jpg",
  "/projects/courtyard-house/ext-front-far.jpg",
  "/projects/courtyard-house/int-living-room.jpg",
  "/projects/courtyard-house/int-kitchen.jpg",
  "/projects/courtyard-house/Ext_Deck 01.jpg",
  "/projects/courtyard-house/int-dining-room.jpg",
  "/projects/courtyard-house/int-master-bedroom-02.jpg",
  "/projects/courtyard-house/int-master-bathroom-01.jpg",
];

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.img
          key={slides[index]}
          src={slides[index]}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      {/* Gradient for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
    </div>
  );
}
