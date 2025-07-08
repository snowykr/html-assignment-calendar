// Assignment CRUD operations service
import { transformDbToJs, transformJsToDbForInsert, transformJsToDbForUpdate } from '@/utils/data-transformer';
import { retryOperation } from '@/utils/retry-utils';
import type { Assignment } from '@/utils/utils';
import { initSupabase, getSupabaseClient } from './supabase-client';

// Database assignment type
interface DbAssignment {
  id: number;
  course_name: string;
  round: string;
  title: string;
  due_date: string;
  due_time: string;
  platform: 'teams' | 'openlms';
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

// Ensure Supabase client is initialized
async function ensureSupabaseClient() {
  if (!getSupabaseClient()) {
    await initSupabase();
  }
  return getSupabaseClient();
}

// Get all assignments with retry logic
export async function getAllAssignments(): Promise<Assignment[]> {
  const fetchOperation = async () => {
    const supabase = await ensureSupabaseClient();
    
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      throw error;
    }

    return data.map((item: DbAssignment) => transformDbToJs(item));
  };

  try {
    return await retryOperation(fetchOperation, 3, 1000);
  } catch (error) {
    // Let the caller handle error translation and logging
    throw error;
  }
}


// Update assignment completion status
export async function updateAssignmentCompletion(id: number, completed: boolean): Promise<Assignment> {
  const supabase = await ensureSupabaseClient();
  
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('assignments')
    .update({ completed })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return transformDbToJs(data);
}

// Add new assignment
export async function addAssignment(assignment: Omit<Assignment, 'id'>): Promise<Assignment> {
  const supabase = await ensureSupabaseClient();
  
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  // Use insert-specific transform function to ensure no id is included
  const dbAssignment = transformJsToDbForInsert(assignment);
  
  const { data, error } = await supabase
    .from('assignments')
    .insert(dbAssignment)
    .select()
    .single();
  
  if (error) throw error;
  
  return transformDbToJs(data);
}

// Update assignment
export async function updateAssignment(id: number, assignment: Partial<Assignment>): Promise<Assignment> {
  const supabase = await ensureSupabaseClient();
  
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  // Use update-specific transform function
  const dbAssignment = transformJsToDbForUpdate(assignment);
  const { data, error } = await supabase
    .from('assignments')
    .update(dbAssignment)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return transformDbToJs(data);
}

// Delete assignment
export async function deleteAssignment(id: number): Promise<boolean> {
  const supabase = await ensureSupabaseClient();
  
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', id);

  if (error) throw error;

  return true;
}