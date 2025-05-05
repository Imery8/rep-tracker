"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { setCompletedDay } from "../../utils/completedDays";
import RestTimerCircle from "./RestTimerCircle";

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

  const [workout, setWorkout] = useState(null);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentRep, setCurrentRep] = useState(1);
  const [showRest, setShowRest] = useState(false);
  const [restTime, setRestTime] = useState(0);

  useEffect(() => {
    const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    const found = workouts.find((w) => w.days && w.days.includes(day));
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

  // Determine if this is the very last rep of the last exercise in the last set
  const isFinalStep = isLastRep && isLastExercise && isLastSet;

  // Next exercise name (for display)
  let nextExerciseName = "-";
  if (!isLastRep) {
    nextExerciseName = exercise.name;
  } else if (!isLastExercise) {
    nextExerciseName = workout.exercises[currentExercise + 1].name;
  } else if (!isLastSet) {
    nextExerciseName = workout.exercises[0].name;
  } else {
    nextExerciseName = "Final exercise";
  }

  const handleNext = () => {
    // If this is the last rep of the last exercise in the last set, finish workout
    if (isFinalStep) {
      setCompletedDay(day);
      router.push("/");
      return;
    }

    // Show rest timer after every rep except the very last rep of the last exercise in the last set
    setShowRest(true);
    setRestTime(exercise.rest);

    // Advance rep/exercise/set after rest
    setTimeout(() => {
      setShowRest(false);
      if (!isLastRep) {
        setCurrentRep(currentRep + 1);
      } else if (!isLastExercise) {
        setCurrentExercise(currentExercise + 1);
        setCurrentRep(1);
      } else if (!isLastSet) {
        setCurrentSet(currentSet + 1);
        setCurrentExercise(0);
        setCurrentRep(1);
      }
    }, (exercise.rest + 0.1) * 1000); // Add a small buffer to ensure timer finishes
  };

  // Helper to format seconds as MM:SS
  function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen flex flex-col justify-between p-4">
      {/* Top Row */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-2xl font-bold">{day}</div>
        <div className="text-3xl font-bold text-center flex-1">Workout Session</div>
        <div className="text-2xl font-bold">Set: {currentSet}/{workout.sets}</div>
      </div>
      {/* Timer */}
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="flex items-center justify-center">
          {showRest ? (
            <RestTimerCircle duration={exercise.rest} timeLeft={restTime} />
          ) : (
            <div className="w-80 h-80 rounded-full border-4 border-black flex items-center justify-center text-6xl font-mono select-none">
              00:00
            </div>
          )}
        </div>
        {/* Exercise/Rep and Next button */}
        <div className="flex items-center justify-center mt-8 gap-8">
          <div className="text-xl">
            <div className="mb-2">Exercise: <span className="font-bold">{exercise.name}</span></div>
            <div>Rep: <span className="font-bold">{currentRep}</span> / {exercise.reps}</div>
          </div>
          <button
            className="ml-8 w-20 h-20 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center shadow-lg hover:bg-blue-700 disabled:bg-gray-300 transition-all"
            onClick={handleNext}
            disabled={showRest}
            style={{ minWidth: 80, minHeight: 80 }}
          >
            {isFinalStep ? "Done" : "Next"}
          </button>
        </div>
        {/* Next Exercise label just below the above row */}
        <div className="flex justify-center mt-6 mb-2">
          {nextExerciseName === "Final exercise" ? (
            <div className="font-bold text-xl">Final Exercise</div>
          ) : (
            <div className="text-xl">Next Exercise: <span className="font-bold">{nextExerciseName}</span></div>
          )}
        </div>
      </div>
    </div>
  );
} 