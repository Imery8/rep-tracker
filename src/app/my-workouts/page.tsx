"use client";
import React, { useState, useEffect } from "react";
import NewWorkoutModal from "./NewWorkoutModal";

export default function MyWorkouts() {
  const [showModal, setShowModal] = useState(false);
  const [workouts, setWorkouts] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("workouts");
    if (stored) setWorkouts(JSON.parse(stored));
  }, []);

  const handleSaveWorkout = (workout: any) => {
    const updated = [...workouts, { ...workout, id: Date.now() }];
    setWorkouts(updated);
    localStorage.setItem("workouts", JSON.stringify(updated));
    setShowModal(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">My Workouts</h1>
      <div className="mb-4 flex justify-end">
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => setShowModal(true)}>
          + New Workout
        </button>
      </div>
      {workouts.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          No workouts yet. Create your first workout!
        </div>
      ) : (
        <ul className="space-y-4 mt-6">
          {workouts.map((w) => (
            <li key={w.id} className="border rounded p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">{w.name}</span>
                <span className="text-sm text-gray-500">{w.sets} sets</span>
              </div>
              <div className="text-sm text-gray-600">Assigned to: {w.days && w.days.length > 0 ? w.days.join(", ") : "No days assigned"}</div>
              <div className="text-sm text-gray-600">Exercises: {w.exercises.length}</div>
            </li>
          ))}
        </ul>
      )}
      {showModal && (
        <NewWorkoutModal onClose={() => setShowModal(false)} onSave={handleSaveWorkout} />
      )}
    </div>
  );
} 