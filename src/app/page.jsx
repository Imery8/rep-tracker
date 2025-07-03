"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCompletedDays, setCompletedDay, removeCompletedDay, clearAllCompletedDays } from "./utils/completedDays";
import { isWorkoutInProgress, clearWorkoutProgress } from "./utils/workoutProgress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "./utils/supabaseClient";
import { useAuth } from "./utils/AuthContext";

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
  const { user, loading } = useAuth();
  const router = useRouter();
  const [completed, setCompleted] = useState({});
  const [workouts, setWorkouts] = useState([]);
  const [workoutsByDay, setWorkoutsByDay] = useState({});
  const [workoutProgress, setWorkoutProgress] = useState({});
  const [completedLoading, setCompletedLoading] = useState(false);
  const [workoutsLoading, setWorkoutsLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);

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
    async function fetchCompletedDays() {
      if (user) {
        setCompletedLoading(true);
        const completedDays = await getCompletedDays(user.id);
        setCompleted(completedDays);
        setCompletedLoading(false);
      }
    }
    fetchCompletedDays();
  }, [user]);

  useEffect(() => {
    async function fetchWorkouts() {
      if (user) {
        setWorkoutsLoading(true);
        const { data, error } = await supabase
          .from("workouts")
          .select("*, exercises(*)")
          .eq("user_id", user.id) // Filter by user
          .order("created_at", { ascending: false });
        setWorkouts(data || []);
        // Map workouts by day
        const byDay = {};
        daysOfWeek.forEach(day => {
          byDay[day] = (data || []).find((w) => {
            let daysArr = Array.isArray(w.days) ? w.days : [];
            if (!Array.isArray(daysArr) && typeof w.days === 'string') {
              try {
                daysArr = JSON.parse(w.days);
              } catch {}
            }
            return daysArr.includes(day);
          }) || null;
        });
        setWorkoutsByDay(byDay);
        setWorkoutsLoading(false);
      }
    }
    fetchWorkouts();
  }, [user]); // Add user as dependency

  useEffect(() => {
    async function checkWorkoutProgress() {
      if (user) {
        setProgressLoading(true);
        const progress = {};
        for (const day of daysOfWeek) {
          progress[day] = await isWorkoutInProgress(user.id, day);
        }
        setWorkoutProgress(progress);
        setProgressLoading(false);
      }
    }
    checkWorkoutProgress();
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleCheckbox = async (day) => {
    if (!user) return;
    
    const isCompleted = !!completed[day];
    const updated = { ...completed, [day]: !isCompleted };
    setCompleted(updated);
    
    if (!isCompleted) {
      // Mark as completed
      await setCompletedDay(user.id, day);
      // Clear any existing progress when marking as completed
      await clearWorkoutProgress(user.id, day);
      // Update local progress state
      setWorkoutProgress(prev => ({
        ...prev,
        [day]: false
      }));
    } else {
      // Remove completed status
      await removeCompletedDay(user.id, day);
      // Don't restore progress when unchecking - user should start fresh
      setWorkoutProgress(prev => ({
        ...prev,
        [day]: false
      }));
    }
  };

  const handleReset = async () => {
    if (!user) return;
    
    await clearAllCompletedDays(user.id);
    setCompleted({});
    
    // Clear workout progress for all days when resetting
    for (const day of daysOfWeek) {
      await clearWorkoutProgress(user.id, day);
    }
    setWorkoutProgress({});
  };

  const handleStart = (day) => {
    const workout = workoutsByDay[day];
    if (workout) {
      // Pass workout data through navigation state
      router.push(`/session/${day.toLowerCase()}`, { 
        state: { workout } 
      });
    }
  };

  const handleResume = (day) => {
    const workout = workoutsByDay[day];
    if (workout) {
      // Pass workout data through navigation state (will auto-resume)
      router.push(`/session/${day.toLowerCase()}`, { 
        state: { workout } 
      });
    }
  };

  const handleRestart = async (day) => {
    if (!user) return;
    
    // Clear the progress for this day
    await clearWorkoutProgress(user.id, day);
    
    // Update local state
    setWorkoutProgress(prev => ({
      ...prev,
      [day]: false
    }));
    
    // Start the workout fresh
    const workout = workoutsByDay[day];
    if (workout) {
      router.push(`/session/${day.toLowerCase()}`, { 
        state: { workout } 
      });
    }
  };

  // Show loading while checking auth
  if (loading) {
    return <div className="max-w-xl mx-auto p-4 text-center">Loading...</div>;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-center flex-1">Workout Tracker</h1>
        <button
          className="ml-4 px-4 py-2 bg-gray-900 rounded hover:bg-gray-800 text-sm font-semibold flex items-center justify-center"
          onClick={handleReset}
          disabled={completedLoading}
          aria-label="Reset"
        >
          <FontAwesomeIcon icon={faRotateRight} size="lg" />
        </button>
      </div>
      {workoutsLoading || completedLoading || progressLoading ? (
        <div className="text-center text-gray-500 mt-10">
          Loading workouts...
        </div>
      ) : (
        <ul className="space-y-4">
          {daysOfWeek.map((day) => {
            const workout = workoutsByDay[day];
            const isCompleted = !!completed[day];
            const isInProgress = !!workoutProgress[day];
            
            return (
              <li key={day} className="flex items-center justify-between border rounded p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => handleCheckbox(day)}
                      disabled={completedLoading}
                      className="w-5 h-5 accent-green-500"
                    />
                    <span className="text-lg font-medium">{day}</span>
                  </div>
                  <span className="text-sm text-gray-500 ml-8">
                    {workout ? `Workout: ${workout.name}` : "No workout assigned"}
                  </span>
                </div>
                <div className="flex gap-2">
                  {isCompleted ? (
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-800"
                      disabled
                    >
                      Completed
                    </button>
                  ) : workout ? (
                    isInProgress ? (
                      <>
                        <button
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm transition-colors"
                          onClick={() => handleResume(day)}
                        >
                          Resume
                        </button>
                        <button
                          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm transition-colors"
                          onClick={() => handleRestart(day)}
                        >
                          Restart
                        </button>
                      </>
                    ) : (
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={() => handleStart(day)}
                      >
                        Start
                      </button>
                    )
                  ) : (
                    <button
                      className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
                      disabled
                    >
                      No Workout
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
} 