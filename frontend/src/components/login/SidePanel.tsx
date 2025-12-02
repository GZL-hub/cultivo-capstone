"use client"

import React, { useEffect, useRef, useState } from 'react';
import { MeshGradient } from "@paper-design/shaders-react";

const SidePanel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-green-950 font-figtree"
    >
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background Shaders */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#022c22", "#f0fdf4", "#10b981", "#064e3b", "#ecfdf5"]}
        speed={0.2}
      />
      
      {/* Full panel backdrop blur to reduce white intensity */}
      <div className="absolute inset-0 w-full h-full backdrop-blur-sm bg-green-950/30"></div>
      
      <div className="absolute inset-0 w-full h-full opacity-40 bg-mesh-pattern"></div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col justify-between w-full h-full px-12 py-12">
        <div className="flex-1 flex flex-col justify-center">
          <div className="p-6">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight drop-shadow-lg text-shadow-dark font-chivo">
              Cloud-Driven insights for smarter agriculture.
            </h2>
            <p className="text-white text-lg text-base leading-relaxed text-shadow-sm">
              Access your cloud dashboard to monitor crops, track sensors, and manage your farm operations.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center text-white/70 text-sm font-noto-sans">
          <span>PRJ3223 Capstone Project</span>
          <span className="cursor-pointer hover:text-white/90">Designed By: Goo Zong Lin</span>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;