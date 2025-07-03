import { supabase } from "./supabaseClient";

// Save workout progress to database
export async function saveWorkoutProgress(userId, day, workoutId, progress) {
  console.log("Saving workout progress:", { userId, day, workoutId, progress });
  const { error } = await supabase
    .from("workout_progress")
    .upsert({
      user_id: userId,
      day: day,
      workout_id: workoutId,
      current_set: progress.currentSet,
      current_exercise: progress.currentExercise,
      current_rep: progress.currentRep,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,day'
    });

  if (error) {
    console.error("Error saving workout progress:", error);
    return false;
  }
  console.log("Workout progress saved successfully");
  return true;
}

// Get workout progress from database
export async function getWorkoutProgress(userId, day) {
  console.log("Getting workout progress for:", { userId, day });
  const { data, error } = await supabase
    .from("workout_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("day", day)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No progress found
      console.log("No workout progress found for:", { userId, day });
      return null;
    }
    console.error("Error getting workout progress:", error);
    return null;
  }

  console.log("Workout progress found:", data);
  return data;
}

// Clear workout progress (when workout is completed or restarted)
export async function clearWorkoutProgress(userId, day) {
  console.log("Clearing workout progress for:", { userId, day });
  const { error } = await supabase
    .from("workout_progress")
    .delete()
    .eq("user_id", userId)
    .eq("day", day);

  if (error) {
    console.error("Error clearing workout progress:", error);
    return false;
  }
  console.log("Workout progress cleared successfully");
  return true;
}

// Check if workout is in progress
export async function isWorkoutInProgress(userId, day) {
  console.log("Checking if workout in progress for:", { userId, day });
  const progress = await getWorkoutProgress(userId, day);
  const result = progress !== null;
  console.log("Workout in progress result:", result);
  return result;
} 