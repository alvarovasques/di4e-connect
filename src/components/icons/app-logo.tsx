
import React from 'react';

const AppLogo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <title>Logo Di4E Connect</title>
    {/* A simple abstract logo: a speech bubble with a gear inside representing intelligent communication */}
    <path d="M85,20 A15,15 0 0,0 70,5 H30 A15,15 0 0,0 15,20 V50 A15,15 0 0,0 30,65 H45 L50,75 L55,65 H70 A15,15 0 0,0 85,50 V20 Z" />
    {/* Gear shape */}
    <circle cx="50" cy="35" r="10" fill="var(--background)" />
    <path d="M50,22 L52,27 L57,28 L53,32 L54,37 L50,35 L46,37 L47,32 L43,28 L48,27 Z" fill="var(--background)" />
  </svg>
);

export default AppLogo;
