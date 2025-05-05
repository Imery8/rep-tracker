import React from "react";

export default function RestTimerCircle({ duration, timeLeft }) {
  const size = 320; // px
  const orangeStroke = 10;
  const greyStroke = 11;
  const radius = (size - greyStroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = -circumference * (timeLeft / duration) + 0.5;

  // Format MM:SS
  const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const s = String(timeLeft % 60).padStart(2, "0");
  const timeString = `${m}:${s}`;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Orange background (full circle) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ff9500"
          strokeWidth={orangeStroke}
          fill="none"
        />
        {/* Grey progress (shrinks to reveal orange) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#222"
          strokeWidth={greyStroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s linear" }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {/* Timer text */}
      <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-mono select-none" style={{ color: '#fff' }}>
        {timeString}
      </div>
    </div>
  );
} 