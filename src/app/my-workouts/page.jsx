"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NewWorkoutModal from "./NewWorkoutModal";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../utils/AuthContext";

export default function MyWorkouts() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [workoutsLoading, setWorkoutsLoading] = useState(true);

  // Fetch workouts from Supabase
  const fetchWorkoutsFromSupabase = async () => {
    if (user) {
      setWorkoutsLoading(true);
      const { data, error } = await supabase
        .from("workouts")
        .select("*, exercises(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error) setWorkouts(data || []);
      setWorkoutsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutsFromSupabase();
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSaveWorkout = async (workout) => {
    if (editingWorkout) {
      // Edit mode: update workout
      const { error: updateError } = await supabase
        .from("workouts")
        .update({
          name: workout.name,
          sets: workout.sets,
          days: workout.days,
        })
        .eq("id", editingWorkout.id)
        .eq("user_id", user.id);
      if (updateError) {
        alert("Error updating workout");
        return;
      }
      // Delete old exercises
      await supabase.from("exercises").delete().eq("workout_id", editingWorkout.id);
      // Insert new/edited exercises
      const exercisesToInsert = workout.exercises.map((ex, idx) => ({
        workout_id: editingWorkout.id,
        name: ex.name,
        reps: ex.reps,
        rest: ex.rest,
        order: idx,
      }));
      const { error: exercisesError } = await supabase
        .from("exercises")
        .insert(exercisesToInsert);
      if (exercisesError) {
        alert("Error saving exercises");
        return;
      }
      fetchWorkoutsFromSupabase();
      setShowModal(false);
      setEditingWorkout(null);
      return;
    }
    // Log the workout object to debug
    console.log("Inserting workout:", {
      name: workout.name,
      sets: workout.sets,
      days: workout.days,
      user_id: user.id,
    });
    // Insert workout into Supabase
    const { data: workoutData, error: workoutError } = await supabase
      .from("workouts")
      .insert([
        {
          name: workout.name,
          sets: workout.sets,
          days: workout.days,
          user_id: user.id,
        },
      ])
      .select();
    if (workoutError || !workoutData || !workoutData[0]) {
      console.error("Supabase workout insert error:", workoutError);
      alert("Error saving workout");
      return;
    }
    const workoutId = workoutData[0].id;
    // Insert exercises into Supabase
    const exercisesToInsert = workout.exercises.map((ex, idx) => ({
      workout_id: workoutId,
      name: ex.name,
      reps: ex.reps,
      rest: ex.rest,
      order: idx,
    }));
    const { error: exercisesError } = await supabase
      .from("exercises")
      .insert(exercisesToInsert);
    if (exercisesError) {
      alert("Error saving exercises");
      return;
    }
    // Fetch updated workouts
    fetchWorkoutsFromSupabase();
    setShowModal(false);
    setEditingWorkout(null);
  };

  const handleDeleteWorkout = async (id) => {
    // Delete exercises for this workout (if not handled by ON DELETE CASCADE)
    await supabase.from("exercises").delete().eq("workout_id", id);
    // Delete the workout
    await supabase.from("workouts").delete().eq("id", id);
    // Refetch workouts
    fetchWorkoutsFromSupabase();
  };

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);
    setShowModal(true);
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
      <h1 className="text-2xl font-bold mb-6 text-center">My Workouts</h1>
      <div className="mb-4 flex justify-end">
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => setShowModal(true)}>
          + New Workout
        </button>
      </div>
      {workoutsLoading ? (
        <div className="text-center text-gray-500 mt-10">
          Loading workouts...
        </div>
      ) : workouts.length === 0 ? (
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
              <div className="text-sm text-gray-600">Exercises: {w.exercises ? w.exercises.length : 0}</div>
              {w.exercises && w.exercises.length > 0 && (
                <ul className="ml-4 mt-2 list-disc text-gray-700">
                  {w.exercises.map((ex) => (
                    <li key={ex.id} className="mb-1">
                      <span className="font-semibold">{ex.name}</span> — {ex.reps} reps, {ex.rest}s rest
                    </li>
                  ))}
                </ul>
              )}
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