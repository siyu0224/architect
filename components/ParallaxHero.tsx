"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

export function ParallaxHero({ src }: { src: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="object-cover w-full h-full" />
      </motion.div>
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
