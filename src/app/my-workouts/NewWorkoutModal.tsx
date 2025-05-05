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

export default function NewWorkoutModal({ onClose, onSave }: { onClose: () => void; onSave: (workout: any) => void }) {
  const [name, setName] = useState("");
  const [sets, setSets] = useState(1);
  const [days, setDays] = useState<string[]>([]);
  const [exercises, setExercises] = useState([
    { name: "", reps: 1, rest: 30 },
  ]);

  const handleExerciseChange = (idx: number, field: string, value: any) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex))
    );
  };

  const addExercise = () => {
    setExercises((prev) => [...prev, { name: "", reps: 1, rest: 30 }]);
  };

  const removeExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDayToggle = (day: string) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, sets, days, exercises });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Create New Workout</h2>
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
                  <input type="number" min={1} placeholder="Reps" className="border rounded px-2 py-1 w-20" value={ex.reps} onChange={e => handleExerciseChange(idx, "reps", Number(e.target.value))} required />
                  <input type="number" min={1} placeholder="Rest (sec)" className="border rounded px-2 py-1 w-24" value={ex.rest} onChange={e => handleExerciseChange(idx, "rest", Number(e.target.value))} required />
                  {exercises.length > 1 && (
                    <button type="button" className="text-red-500" onClick={() => removeExercise(idx)}>&times;</button>
                  )}
                </div>
              ))}
              <button type="button" className="text-blue-600 font-medium" onClick={addExercise}>+ Add Exercise</button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-300" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">Save Workout</button>
          </div>
        </form>
      </div>
    </div>
  );
} 