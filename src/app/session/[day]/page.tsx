"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  let day = params?.day || "";
  if (Array.isArray(day)) day = day.join("");
  day = day.charAt(0).toUpperCase() + day.slice(1);

  const [workout, setWorkout] = useState<any | null>(null);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentRep, setCurrentRep] = useState(1);
  const [showRest, setShowRest] = useState(false);
  const [restTime, setRestTime] = useState(0);

  useEffect(() => {
    const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    const found = workouts.find((w: any) => w.days && w.days.includes(day));
    setWorkout(found || null);
  }, [day]);

  useEffect(() => {
    if (showRest && restTime > 0) {
      const timer = setInterval(() => {
        setRestTime((t) => {
          if (t <= 1) {
            setShowRest(false);
            clearInterval(timer);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showRest, restTime]);

  if (!daysOfWeek.includes(day)) {
    return <div className="max-w-xl mx-auto p-4 text-center text-red-500">Invalid day.</div>;
  }

  if (!workout) {
    return <div className="max-w-xl mx-auto p-4 text-center text-gray-500">No workout assigned for {day}.</div>;
  }

  const exercise = workout.exercises[currentExercise];
  const isLastRep = currentRep === exercise.reps;
  const isLastExercise = currentExercise === workout.exercises.length - 1;
  const isLastSet = currentSet === workout.sets;
  const nextExerciseName = !isLastExercise ? workout.exercises[currentExercise + 1].name : "-";

  const handleNext = () => {
    if (!isLastRep) {
      setShowRest(true);
      setRestTime(exercise.rest);
    } else if (!isLastExercise) {
      setCurrentExercise(currentExercise + 1);
      setCurrentRep(1);
    } else if (!isLastSet) {
      setCurrentSet(currentSet + 1);
      setCurrentExercise(0);
      setCurrentRep(1);
    } else {
      // Workout complete
      // Mark day as complete and redirect home
      const completed = JSON.parse(localStorage.getItem("completedDays") || "{}") || {};
      completed[day] = true;
      localStorage.setItem("completedDays", JSON.stringify(completed));
      router.push("/");
    }
    if (!isLastRep) setCurrentRep(currentRep + 1);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Workout Session</h1>
      <div className="mb-2 text-center text-lg font-semibold">{day}</div>
      <div className="mb-2 text-center">Set: <span className="font-bold">{currentSet}</span> / {workout.sets}</div>
      <div className="mb-2 text-center">Exercise: <span className="font-bold">{exercise.name}</span></div>
      <div className="mb-2 text-center">Rep: <span className="font-bold">{currentRep}</span> / {exercise.reps}</div>
      <div className="mb-2 text-center">Next Exercise: <span className="font-bold">{nextExerciseName}</span></div>
      {/* Timer UI will go here */}
      {showRest && (
        <div className="text-center my-6">
          <div className="text-2xl font-bold mb-2">Rest: {restTime}s</div>
          <div className="text-gray-500">Get ready for the next rep!</div>
        </div>
      )}
      <div className="flex justify-center mt-6">
        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300" onClick={handleNext} disabled={showRest}>
          Next
        </button>
      </div>
    </div>
  );
} 