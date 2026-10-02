import React from 'react';
import { motion } from 'framer-motion';

export const LeavesParticles = ({ count = 10 }) => {
  const leaves = Array.from({ length: count });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {leaves.map((_, i) => {
        const size = Math.random() * 14 + 12; // 12px to 26px
        const left = Math.random() * 95;
        const initialTop = Math.random() * 80;
        const duration = Math.random() * 12 + 10; // 10s to 22s
        const delay = Math.random() * 5;

        return (
          <motion.div
            key={i}
            className="absolute opacity-40 text-leaf-green"
            style={{ left: `${left}%`, top: `${initialTop}%` }}
            animate={{
              y: [0, 120, 240],
              x: [0, (i % 2 === 0 ? 25 : -25), 0],
              rotate: [0, 180, 360],
              opacity: [0.2, 0.6, 0.1]
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg
              width={size}
              height={size * 1.3}
              viewBox="0 0 24 32"
              fill="currentColor"
              className="drop-shadow-sm"
            >
              <path d="M12 2C6.5 2 2 7.5 2 14c0 7.5 7 14 10 16 3-2 10-8.5 10-16 0-6.5-4.5-12-10-12zm0 25c-2.5-2-7-7.5-7-13 0-4.5 3-8.5 7-8.5s7 4 7 8.5c0 5.5-4.5 11-7 13z" />
              <path d="M12 7v17" stroke="#173F2A" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
};

export default LeavesParticles;
