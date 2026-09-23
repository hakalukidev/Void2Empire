"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  expiresAt: string; // ISO timestamp
  onExpire?: () => void;
  warningThresholdSeconds?: number;
}

export function CountdownTimer({ expiresAt, onExpire, warningThresholdSeconds = 300 }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff === 0) onExpire?.();
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;

  const isWarning = secondsLeft <= warningThresholdSeconds && secondsLeft > 0;
  const isExpired = secondsLeft === 0;

  return (
    <span className={`font-mono font-bold tabular-nums ${
      isExpired ? "text-danger" : isWarning ? "text-warning" : "text-success"
    }`}>
      {isExpired
        ? "Expired"
        : h > 0
          ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
          : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`}
    </span>
  );
}
