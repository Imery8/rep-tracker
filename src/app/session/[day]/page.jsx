"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { setCompletedDay } from "../../utils/completedDays";
import { saveWorkoutProgress, getWorkoutProgress, clearWorkoutProgress } from "../../utils/workoutProgress";
import RestTimerCircle from "./RestTimerCircle";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../utils/AuthContext";

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
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  let day = params?.day || "";
  if (Array.isArray(day)) day = day.join("");
  day = day.charAt(0).toUpperCase() + day.slice(1);

  const [workout, setWorkout] = useState(null);
  const [stateLoading, setStateLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentRep, setCurrentRep] = useState(1);
  const [showRest, setShowRest] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [hasUserProgressed, setHasUserProgressed] = useState(false);

  // Save progress when component unmounts or user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && workout && !showRest && hasUserProgressed) {
        console.log("Saving progress on beforeunload:", {
          currentSet,
          currentExercise,
          currentRep
        });
        saveWorkoutProgress(user.id, day, workout.id, {
          currentSet,
          currentExercise,
          currentRep
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && user && workout && !showRest && hasUserProgressed) {
        console.log("Saving progress on visibility change:", {
          currentSet,
          currentExercise,
          currentRep
        });
        saveWorkoutProgress(user.id, day, workout.id, {
          currentSet,
          currentExercise,
          currentRep
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Save progress when component unmounts
      if (user && workout && !showRest && hasUserProgressed) {
        console.log("Saving progress on unmount:", {
          currentSet,
          currentExercise,
          currentRep
        });
        saveWorkoutProgress(user.id, day, workout.id, {
          currentSet,
          currentExercise,
          currentRep
        });
      }
    };
  }, [user, workout, day, currentSet, currentExercise, currentRep, showRest, hasUserProgressed]);

  // Try to get workout from navigation state first, then fetch if needed
  useEffect(() => {
    async function loadWorkoutAndProgress() {
      let workoutData = null;
      
      // Check if we have workout data in navigation state
      if (router.state?.workout) {
        workoutData = router.state.workout;
      } else {
        // Fallback: fetch workout from database
        const { data, error } = await supabase
          .from("workouts")
          .select("*, exercises(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) {
          setWorkout(null);
          setStateLoading(false);
          setProgressLoading(false);
          return;
        }
        // Find the workout assigned to this day
        workoutData = (data || []).find((w) => {
          let daysArr = Array.isArray(w.days) ? w.days : [];
          if (!Array.isArray(daysArr) && typeof w.days === 'string') {
            try {
              daysArr = JSON.parse(w.days);
            } catch {}
          }
          return daysArr.includes(day);
        }) || null;
      }
      
      setWorkout(workoutData);
      setStateLoading(false);
      
      // Load progress after workout is set
      if (workoutData && user) {
        setProgressLoading(true);
        console.log("Loading progress for workout:", workoutData.id);
        const progress = await getWorkoutProgress(user.id, day);
        console.log("Progress loaded:", progress);
        if (progress) {
          console.log("Setting progress state:", {
            currentSet: progress.current_set,
            currentExercise: progress.current_exercise,
            currentRep: progress.current_rep
          });
          setCurrentSet(progress.current_set);
          setCurrentExercise(progress.current_exercise);
          setCurrentRep(progress.current_rep);
        } else {
          console.log("No progress found, using default values");
        }
        setProgressLoading(false);
      } else {
        setProgressLoading(false);
      }
    }
    
    if (user) {
      loadWorkoutAndProgress();
    } else {
      setStateLoading(false);
      setProgressLoading(false);
    }
  }, [day, user, router.state]);

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

  useEffect(() => {
    // Disable scrolling on session page
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleNext = async () => {
    // If this is the last rep of the last exercise in the last set, finish workout
    if (isFinalStep) {
      if (user) {
        await setCompletedDay(user.id, day);
        await clearWorkoutProgress(user.id, day); // Clear progress when completed
      }
      router.push("/");
      return;
    }

    // Mark that user has progressed
    setHasUserProgressed(true);

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

  // Show loading while checking auth
  if (authLoading) {
    return <div className="max-w-xl mx-auto p-4 text-center">Loading...</div>;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  if (!daysOfWeek.includes(day)) {
    return <div className="max-w-xl mx-auto p-4 text-center text-red-500">Invalid day.</div>;
  }

  
  // Show brief loading while waiting for workout data
  if (stateLoading || progressLoading || !workout) {
    return <div className="max-w-xl mx-auto p-4 text-center text-gray-500">Loading workout...</div>;
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

  return (
    <div className="max-w-2xl mx-auto min-h-screen flex flex-col justify-between p-4 pt-2 sm:pt-4">
      {/* Top Row */}
      <div className="flex justify-between items-center mb-4 sm:mb-8 mt-2 sm:mt-0">
        <div className="text-2xl font-bold">{day}</div>
        <div className="text-3xl font-bold text-center flex-1">Workout Session</div>
        <div className="text-2xl font-bold">Set: {currentSet}/{workout.sets}</div>
      </div>
      {/* Timer */}
      <div className="flex flex-col items-center justify-center flex-1 mt-[-200px] sm:mt-0">
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
        <div className="flex items-center justify-center mt-6 sm:mt-8 gap-8">
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
        <div className="flex justify-center mt-4 sm:mt-6 mb-2">
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