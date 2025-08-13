"use client";
import React from "react";

export const GlowingEffect = ({ 
  spread = 30,
  glow = true,
  color = "rgba(248, 255, 36, 0.2)"
}) => {
  return glow ? (
    <div 
      className="absolute inset-0 -z-10 overflow-hidden"
      style={{
        background: `radial-gradient(${spread}px circle at var(--mouse-x) var(--mouse-y), 
                    ${color}, transparent 80%)`,
      }}
    />
  ) : null;
};