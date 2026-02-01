'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!deadline) return;

    function calc() {
      const diff = new Date(deadline) - Date.now();
      if (diff <= 0) return { expired: true };
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return { d, h, m, s, expired: false, total: diff };
    }

    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline || !timeLeft) return null;
  if (timeLeft.expired) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-mono">
        <span className="animate-pulse">⏰</span> Voting ended
      </div>
    );
  }

  const urgent = timeLeft.total < 3600000; // < 1 hour

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-mono border ${
      urgent 
        ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' 
        : 'bg-arena-accent/10 border-arena-accent/30 text-arena-accent'
    }`}>
      <span>⏱️</span>
      <span>
        {timeLeft.d > 0 && `${timeLeft.d}d `}
        {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
      </span>
      <span className="text-xs opacity-70">left to vote</span>
    </div>
  );
}
