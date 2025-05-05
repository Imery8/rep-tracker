"use client";
import { useState, useEffect } from "react";
import { getCompletedDays } from "./utils/completedDays";

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
    // Load workouts and map by day
    const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    const byDay = {};
    daysOfWeek.forEach(day => {
      byDay[day] = workouts.find((w) => w.days && w.days.includes(day)) || null;
    });
    setWorkoutsByDay(byDay);
  }, []);

  useEffect(() => {
    setCompleted(getCompletedDays());
  }, []);

  const handleCheckbox = (day) => {
    const updated = { ...completed, [day]: !completed[day] };
    setCompleted(updated);
    localStorage.setItem("completedDays", JSON.stringify(updated));
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
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-800"
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