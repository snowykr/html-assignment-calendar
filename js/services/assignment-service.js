// Assignment CRUD operations service
import { initSupabase, getSupabaseClient } from './supabase-client.js';
import { transformDbToJs, transformJsToDbForInsert, transformJsToDbForUpdate } from '../utils/data-transformer.js';
import { retryOperation } from '../utils/retry-utils.js';

// Ensure Supabase client is initialized
async function ensureSupabaseClient() {
    if (!getSupabaseClient()) {
        await initSupabase();
    }
    return getSupabaseClient();
}

// Get all assignments with retry logic
export async function getAllAssignments() {
    const fetchOperation = async () => {
        const supabase = await ensureSupabaseClient();

        const { data, error } = await supabase
            .from('assignments')
            .select('*')
            .order('due_date', { ascending: true });

        if (error) {
            throw error;
        }

        return data.map(transformDbToJs);
    };

    try {
        return await retryOperation(fetchOperation, 3, 1000);
    } catch (error) {
        console.error('❌ Failed to fetch assignments:', error.message || 'Unknown error');
        throw error;
    }
}

// Get assignments by date
export async function getAssignmentsByDate(date) {
    const supabase = await ensureSupabaseClient();

    try {
        const { data, error } = await supabase
            .from('assignments')
            .select('*')
            .eq('due_date', date)
            .order('due_time', { ascending: true });

        if (error) throw error;

        return data.map(transformDbToJs);
    } catch (error) {
        console.error('Error fetching assignments by date:', error);
        throw error;
    }
}

// Update assignment completion status
export async function updateAssignmentCompletion(id, completed) {
    const supabase = await ensureSupabaseClient();

    try {
        const { data, error } = await supabase
            .from('assignments')
            .update({ completed })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return transformDbToJs(data);
    } catch (error) {
        console.error('Error updating assignment completion:', error);
        throw error;
    }
}

// Add new assignment
export async function addAssignment(assignment) {
    const supabase = await ensureSupabaseClient();

    try {
        // Use insert-specific transform function to ensure no id is included
        const dbAssignment = transformJsToDbForInsert(assignment);
        
        const { data, error } = await supabase
            .from('assignments')
            .insert(dbAssignment)
            .select()
            .single();
        
        if (error) {
            // Handle specific database constraint errors
            if (error.code === '23505') {
                console.error('Primary key conflict detected:', error);
                throw new Error('ID conflict has occurred in the database. Please contact the administrator.');
            }
            throw error;
        }
        
        return transformDbToJs(data);
    } catch (error) {
        console.error('Error adding assignment:', error);
        throw error;
    }
}

// Update assignment
export async function updateAssignment(id, assignment) {
    const supabase = await ensureSupabaseClient();

    try {
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
    } catch (error) {
        console.error('Error updating assignment:', error);
        throw error;
    }
}

// Delete assignment
export async function deleteAssignment(id) {
    const supabase = await ensureSupabaseClient();

    try {
        const { error } = await supabase
            .from('assignments')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return true;
    } catch (error) {
        console.error('Error deleting assignment:', error);
        throw error;
    }
}