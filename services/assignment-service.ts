// Assignment CRUD operations service
import { transformDbToJs, transformJsToDbForInsert, transformJsToDbForUpdate } from '@/utils/data-transformer';
import { retryOperation } from '@/utils/retry-utils';
import type { Assignment } from '@/utils/utils';
import { createClient } from '@supabase/supabase-js';

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
      .from('assignments_demo')
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
    .from('assignments_demo')
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
  console.log('🚀 addAssignment 시작:', assignment);
  
  if (!supabaseAccessToken) {
    console.error('❌ supabaseAccessToken이 없음');
    throw new Error('Authentication required. Please log in.');
  }
  console.log('✅ supabaseAccessToken 존재:', supabaseAccessToken.substring(0, 20) + '...');

  if (!assignment.userId) {
    console.error('❌ userId가 없음:', assignment);
    throw new Error('User ID is required for creating assignments');
  }
  console.log('✅ userId 존재:', assignment.userId);

  const supabase = createAuthenticatedSupabaseClient(supabaseAccessToken);
  console.log('✅ Supabase 클라이언트 생성 완료');

  // Use insert-specific transform function to ensure no id is included
  const dbAssignment = transformJsToDbForInsert(assignment);
  console.log('🔄 변환된 DB 데이터:', dbAssignment);
  
  console.log('📤 Supabase에 데이터 삽입 시도...');
  const { data, error } = await supabase
    .from('assignments_demo')
    .insert(dbAssignment)
    .select()
    .single();
  
  if (error) {
    console.error('❌ Supabase 삽입 에러:', error);
    console.error('❌ 에러 상세:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }
  
  console.log('✅ Supabase 삽입 성공:', data);
  const result = transformDbToJs(data);
  console.log('✅ 최종 반환 데이터:', result);
  
  return result;
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
    .from('assignments_demo')
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
    .from('assignments_demo')
    .delete()
    .eq('id', id);

  if (error) throw error;

  return true;
}