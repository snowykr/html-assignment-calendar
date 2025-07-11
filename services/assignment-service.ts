// Assignment CRUD operations service
import { transformDbToJs, transformJsToDbForInsert, transformJsToDbForUpdate } from '@/utils/data-transformer';
import { retryOperation } from '@/utils/retry-utils';
import type { Assignment } from '@/utils/utils';
import { createClient } from '@supabase/supabase-js';

// Database assignment type
interface DbAssignment {
  id: number;
  course_name: string;
  lesson: string;
  title: string;
  due_date: string;
  due_time: string;
  platform: 'teams' | 'openlms';
  completed: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  link?: string;
  memo?: string;
}


// Singleton Supabase client cache
let supabaseClientCache: { [key: string]: any } = {};

// Create authenticated Supabase client with user token (singleton pattern)
function createAuthenticatedSupabaseClient(supabaseAccessToken: string) {
  if (!supabaseAccessToken) {
    throw new Error('Authentication required. Please log in.');
  }

  // Use token as cache key (first 20 characters for security)
  const cacheKey = supabaseAccessToken.substring(0, 20);
  
  if (!supabaseClientCache[cacheKey]) {
    supabaseClientCache[cacheKey] = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${supabaseAccessToken}`,
          },
        },
      }
    );
  }
  
  return supabaseClientCache[cacheKey];
}

// Get all assignments with retry logic (user-specific with RLS)
export async function getAllAssignments(supabaseAccessToken: string): Promise<Assignment[]> {
  if (!supabaseAccessToken) {
    throw new Error('Authentication required. Please log in.');
  }

  const fetchOperation = async () => {
    const supabase = createAuthenticatedSupabaseClient(supabaseAccessToken);

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
export async function updateAssignmentCompletion(
  id: number, 
  completed: boolean, 
  supabaseAccessToken: string
): Promise<Assignment> {
  if (!supabaseAccessToken) {
    throw new Error('Authentication required. Please log in.');
  }

  const supabase = createAuthenticatedSupabaseClient(supabaseAccessToken);

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
export async function addAssignment(
  assignment: Omit<Assignment, 'id'>, 
  supabaseAccessToken: string
): Promise<Assignment> {
  if (!supabaseAccessToken) {
    throw new Error('Authentication required. Please log in.');
  }

  if (!assignment.userId) {
    throw new Error('User ID is required for creating assignments');
  }

  const supabase = createAuthenticatedSupabaseClient(supabaseAccessToken);

  // Use insert-specific transform function to ensure no id is included
  const dbAssignment = transformJsToDbForInsert(assignment);
  
  const { data, error } = await supabase
    .from('assignments')
    .insert(dbAssignment)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return transformDbToJs(data);
}

// Update assignment
export async function updateAssignment(
  id: number, 
  assignment: Partial<Assignment>, 
  supabaseAccessToken: string
): Promise<Assignment> {
  if (!supabaseAccessToken) {
    throw new Error('Authentication required. Please log in.');
  }

  const supabase = createAuthenticatedSupabaseClient(supabaseAccessToken);

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
export async function deleteAssignment(id: number, supabaseAccessToken: string): Promise<boolean> {
  if (!supabaseAccessToken) {
    throw new Error('Authentication required. Please log in.');
  }

  const supabase = createAuthenticatedSupabaseClient(supabaseAccessToken);

  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', id);

  if (error) throw error;

  return true;
}