"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * Word-by-word vertical clip reveal on scroll.
 * Each word slides up from below a masked boundary.
 */
export function TextReveal({
  children,
  className,
  style,
  delay = 0,
  stagger = 0.06,
}: {
  children: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const words = children.split(" ");

  return (
    <span ref={ref} className={className} style={style}>
      {words.map((word, wi) => (
        <span
          key={wi}
          className="inline-block overflow-hidden align-top"
        >
          <motion.span
            className="inline-block"
            initial={{ y: "100%" }}
            animate={inView ? { y: "0%" } : {}}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: delay + wi * stagger,
            }}
          >
            {word}
          </motion.span>
          {wi < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </span>
  );
}
