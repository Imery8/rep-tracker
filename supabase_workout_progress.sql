-- Create workout_progress table
CREATE TABLE IF NOT EXISTS workout_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  current_set INTEGER NOT NULL DEFAULT 1,
  current_exercise INTEGER NOT NULL DEFAULT 0,
  current_rep INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day)
);

-- Enable Row Level Security
ALTER TABLE workout_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own workout progress" ON workout_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout progress" ON workout_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout progress" ON workout_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout progress" ON workout_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_workout_progress_user_day ON workout_progress(user_id, day); 