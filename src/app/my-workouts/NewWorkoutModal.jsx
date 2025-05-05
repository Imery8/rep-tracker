"use client";
import React, { useState } from "react";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function NewWorkoutModal({ onClose, onSave, initialWorkout }) {
  const [name, setName] = useState(initialWorkout ? initialWorkout.name : "");
  const [sets, setSets] = useState(initialWorkout ? initialWorkout.sets : 1);
  const [days, setDays] = useState(initialWorkout ? initialWorkout.days : []);
  const [exercises, setExercises] = useState(
    initialWorkout
      ? initialWorkout.exercises.map(ex => ({
          ...ex,
          reps: ex.reps === 1 ? "" : ex.reps,
          rest: ex.rest === 30 ? "" : ex.rest,
        }))
      : [{ name: "", reps: "", rest: "" }]
  );

  const handleExerciseChange = (idx, field, value) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex))
    );
  };

  const addExercise = () => {
    setExercises((prev) => [...prev, { name: "", reps: "", rest: "" }]);
  };

  const removeExercise = (idx) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDayToggle = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert reps/rest to numbers or set defaults if empty
    const cleanedExercises = exercises.map((ex) => ({
      ...ex,
      reps: ex.reps === "" ? 1 : Number(ex.reps),
      rest: ex.rest === "" ? 30 : Number(ex.rest),
    }));
    onSave({ name, sets, days, exercises: cleanedExercises });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">{initialWorkout ? "Edit Workout" : "Create New Workout"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Workout Name</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block font-medium mb-1">Number of Sets</label>
            <input type="number" min={1} className="w-24 border rounded px-3 py-2" value={sets} onChange={e => setSets(Number(e.target.value))} required />
          </div>
          <div>
            <label className="block font-medium mb-1">Assign to Days</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map(day => (
                <label key={day} className="flex items-center gap-1">
                  <input type="checkbox" checked={days.includes(day)} onChange={() => handleDayToggle(day)} />
                  {day}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Exercises</label>
            <div className="space-y-3">
              {exercises.map((ex, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input type="text" placeholder="Exercise Name" className="border rounded px-2 py-1 flex-1" value={ex.name} onChange={e => handleExerciseChange(idx, "name", e.target.value)} required />
                  <input type="number" min={1} placeholder="Reps" className="border rounded px-2 py-1 w-20" value={ex.reps} onChange={e => handleExerciseChange(idx, "reps", e.target.value)} required />
                  <input type="number" min={1} placeholder="Rest (s)" className="border rounded px-2 py-1 w-24" value={ex.rest} onChange={e => handleExerciseChange(idx, "rest", e.target.value)} required />
                  {exercises.length > 1 && (
                    <button type="button" className="text-red-500" onClick={() => removeExercise(idx)}>&times;</button>
                  )}
                </div>
              ))}
              <button type="button" className="text-blue-600 font-medium" onClick={addExercise}>+ Add Exercise</button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-500" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">{initialWorkout ? "Save Changes" : "Save Workout"}</button>
          </div>
        </form>
      </div>
    </div>
  );
} 