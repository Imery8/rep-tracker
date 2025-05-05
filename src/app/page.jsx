"use client";
import { useState, useEffect } from "react";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Home() {
  const [completed, setCompleted] = useState({});
  const [workoutsByDay, setWorkoutsByDay] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("completedDays");
    if (stored) setCompleted(JSON.parse(stored));
    // Load workouts and map by day
    const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    const byDay = {};
    daysOfWeek.forEach(day => {
      byDay[day] = workouts.find((w) => w.days && w.days.includes(day)) || null;
    });
    setWorkoutsByDay(byDay);
  }, []);

  useEffect(() => {
    localStorage.setItem("completedDays", JSON.stringify(completed));
  }, [completed]);

  // Add a useEffect to listen for storage changes and update completed state
  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem("completedDays");
      if (stored) setCompleted(JSON.parse(stored));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Add a useEffect to update completed state when the page becomes visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const stored = localStorage.getItem("completedDays");
        if (stored) setCompleted(JSON.parse(stored));
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const handleCheckbox = (day) => {
    setCompleted((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleStart = (day) => {
    window.location.href = `/session/${day.toLowerCase()}`;
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Workout Tracker</h1>
      <ul className="space-y-4">
        {daysOfWeek.map((day) => (
          <li key={day} className="flex items-center justify-between border rounded p-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!completed[day]}
                  onChange={() => handleCheckbox(day)}
                  className="w-5 h-5 accent-green-500"
                />
                <span className="text-lg font-medium">{day}</span>
              </div>
              <span className="text-sm text-gray-500 ml-8">
                {workoutsByDay[day] ? `Workout: ${workoutsByDay[day].name}` : "No workout assigned"}
              </span>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
              onClick={() => handleStart(day)}
              disabled={!!completed[day] || !workoutsByDay[day]}
            >
              {completed[day] ? "Completed" : workoutsByDay[day] ? "Start" : "No Workout"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 