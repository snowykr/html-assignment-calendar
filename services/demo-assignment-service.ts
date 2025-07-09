// Demo Assignment service for read-only access to assignments_demo table
import { transformDbToJs } from '@/utils/data-transformer';
import { retryOperation } from '@/utils/retry-utils';
import type { Assignment } from '@/utils/utils';
import { createClient } from '@supabase/supabase-js';

// Error messages for demo mode restrictions
const DEMO_ERROR_MESSAGES = {
  update: 'demo.demoModeUpdateRestriction',
  add: 'demo.demoModeAddRestriction', 
  delete: 'demo.demoModeDeleteRestriction'
} as const;

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

// Create demo Supabase client with anon key (no authentication required)
let demoSupabaseClient: ReturnType<typeof createClient> | null = null;

function createDemoSupabaseClient() {
  if (!demoSupabaseClient) {
    demoSupabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return demoSupabaseClient;
}

// Get all demo assignments (read-only)
export async function getAllDemoAssignments(): Promise<Assignment[]> {
  const fetchOperation = async () => {
    const supabase = createDemoSupabaseClient();

    const { data, error } = await supabase
      .from('assignments_demo')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      throw error;
    }

    return (data as unknown as DbAssignment[]).map((item: DbAssignment) => transformDbToJs(item));
  };

  try {
    return await retryOperation(fetchOperation, 3, 1000);
  } catch (error) {
    throw error;
  }
}

// Demo mode - all modification operations are disabled
export async function updateDemoAssignmentCompletion(): Promise<never> {
  throw new Error(DEMO_ERROR_MESSAGES.update);
}

export async function addDemoAssignment(): Promise<never> {
  throw new Error(DEMO_ERROR_MESSAGES.add);
}

export async function updateDemoAssignment(): Promise<never> {
  throw new Error(DEMO_ERROR_MESSAGES.update);
}

export async function deleteDemoAssignment(): Promise<never> {
  throw new Error(DEMO_ERROR_MESSAGES.delete);
}