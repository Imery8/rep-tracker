import React, { useEffect, useState } from "react";

export default function RestTimerCircle({ duration, timeLeft }) {
  const size = 320;
  const orangeStroke = 10;
  const greyStroke = 11;
  const radius = (size - greyStroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const [initialTime] = useState(Date.now());

  const elapsed = Math.min((Date.now() - initialTime) / 1000, duration);

  // Format MM:SS
  const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const s = String(timeLeft % 60).padStart(2, "0");
  const timeString = `${m}:${s}`;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size}}
    >
      <svg width={size} height={size}>
        {/* Background orange circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ff9500"
          strokeWidth={orangeStroke}
          fill="none"
        />
        {/* Animated progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#222"
          strokeWidth={greyStroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}

          style={{
            animation: `dash ${duration}s linear forwards`
          }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-mono select-none">
        {timeString}
      </div>
      <style jsx>{`
        @keyframes dash {
          from {
            stroke-dashoffset: ${circumference};
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}