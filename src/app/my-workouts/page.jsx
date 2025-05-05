"use client";
import React, { useState, useEffect } from "react";
import NewWorkoutModal from "./NewWorkoutModal";

export default function MyWorkouts() {
  const [showModal, setShowModal] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [editingWorkout, setEditingWorkout] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("workouts");
    if (stored) setWorkouts(JSON.parse(stored));
  }, []);

  const handleSaveWorkout = (workout) => {
    let updated;
    if (editingWorkout) {
      // Edit mode: update existing workout
      updated = workouts.map((w) => w.id === editingWorkout.id ? { ...workout, id: editingWorkout.id } : w);
    } else {
      // New workout
      updated = [...workouts, { ...workout, id: Date.now() }];
    }
    setWorkouts(updated);
    localStorage.setItem("workouts", JSON.stringify(updated));
    setShowModal(false);
    setEditingWorkout(null);
  };

  const handleDeleteWorkout = (id) => {
    const updated = workouts.filter((w) => w.id !== id);
    setWorkouts(updated);
    localStorage.setItem("workouts", JSON.stringify(updated));
  };

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);
    setShowModal(true);
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
              <div className="flex gap-2 mt-2">
                <button className="px-3 py-1 rounded bg-gray-600 text-black hover:bg-gray-400" onClick={() => handleEditWorkout(w)}>Edit</button>
                <button className="px-3 py-1 rounded bg-red-700 text-white hover:bg-red-600" onClick={() => handleDeleteWorkout(w.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {showModal && (
        <NewWorkoutModal
          onClose={() => { setShowModal(false); setEditingWorkout(null); }}
          onSave={handleSaveWorkout}
          initialWorkout={editingWorkout}
        />
      )}
    </div>
  );
} 