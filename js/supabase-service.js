// Main Supabase service facade - delegates to modular services
import { initSupabase as initSupabaseClient } from './services/supabase-client.js';
import {
    getAllAssignments as getAssignments,
    getAssignmentsByDate as getAssignmentsByDateService,
    updateAssignmentCompletion as updateCompletionService,
    addAssignment as addAssignmentService,
    updateAssignment as updateAssignmentService,
    deleteAssignment as deleteAssignmentService
} from './services/assignment-service.js';
import { setSupabaseConfig as setConfigService, setCachedConfig } from './config/supabase-config.js';
import { resetSupabaseClient } from './services/supabase-client.js';

// Facade functions that delegate to modular services

// Initialize Supabase client
export async function initSupabase() {
    return await initSupabaseClient();
}

// Get all assignments
export async function getAllAssignments() {
    return await getAssignments();
}

// Get assignments by date
export async function getAssignmentsByDate(date) {
    return await getAssignmentsByDateService(date);
}

// Update assignment completion status
export async function updateAssignmentCompletion(id, completed) {
    return await updateCompletionService(id, completed);
}

// Add new assignment
export async function addAssignment(assignment) {
    return await addAssignmentService(assignment);
}

// Update assignment
export async function updateAssignment(id, assignment) {
    return await updateAssignmentService(id, assignment);
}

// Delete assignment
export async function deleteAssignment(id) {
    return await deleteAssignmentService(id);
}



// Manual configuration setter (for development/testing)
export function setSupabaseConfig(url, anonKey) {
    const config = setConfigService(url, anonKey);
    setCachedConfig(config);
    
    // Reset supabase client to use new config on next operation
    resetSupabaseClient();
    
    return config;
}
