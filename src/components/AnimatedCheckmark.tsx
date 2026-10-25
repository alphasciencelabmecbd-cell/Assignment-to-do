'use client';

import React from 'react';

interface AnimatedCheckmarkProps {
  size?: number;
  className?: string;
  glowColor?: string;
}

export default function AnimatedCheckmark({
  size = 64,
  className = '',
}: AnimatedCheckmarkProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background glow halo */}
      <div
        className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse"
        style={{ transform: 'scale(1.3)' }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Animated Circle */}
        <circle
          cx="26"
          cy="26"
          r="24"
          stroke="#10b981"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="animate-draw-circle"
          style={{
            strokeDasharray: 160,
            filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))',
          }}
        />

        {/* Animated Check Path */}
        <path
          d="M14 27l8 8 16-16"
          stroke="#34d399"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw-check"
          style={{
            strokeDasharray: 48,
            filter: 'drop-shadow(0 0 4px rgba(52, 211, 153, 0.8))',
          }}
        />
      </svg>
    </div>
  );
}
