import { supabase } from './supabaseClient';

export async function getCompletedDays(userId) {
  if (!userId) return {};
  
  const { data, error } = await supabase
    .from('completed_days')
    .select('day')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching completed days:', error);
    return {};
  }
  
  const completed = {};
  data.forEach(item => {
    completed[item.day] = true;
  });
  return completed;
}

export async function setCompletedDay(userId, day) {
  if (!userId) return false;
  
  const { error } = await supabase
    .from('completed_days')
    .upsert({ user_id: userId, day });
  
  if (error) {
    console.error('Error setting completed day:', error);
    return false;
  }
  
  return true;
}

export async function removeCompletedDay(userId, day) {
  if (!userId) return false;
  
  const { error } = await supabase
    .from('completed_days')
    .delete()
    .eq('user_id', userId)
    .eq('day', day);
  
  if (error) {
    console.error('Error removing completed day:', error);
    return false;
  }
  
  return true;
}

export async function clearAllCompletedDays(userId) {
  if (!userId) return false;
  
  const { error } = await supabase
    .from('completed_days')
    .delete()
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error clearing completed days:', error);
    return false;
  }
  
  return true;
} 