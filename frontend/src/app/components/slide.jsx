"use client";

import React, { useRef } from "react";
import { motion, useInView } from "motion/react";

export default function Slide({ children, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      className="w-full"
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : 10,
      }}
      transition={{
        duration: 0.5,
        delay: delay,
        ease: [0.42, 0, 0.58, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
