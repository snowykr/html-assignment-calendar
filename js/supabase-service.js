



// Initialize Supabase client
let supabase = null;

// Wait for Supabase CDN to load
function waitForSupabase(timeout = 10000) {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.supabase) {
            resolve(window.supabase);
            return;
        }

        const startTime = Date.now();
        
        const checkInterval = setInterval(() => {
            if (window.supabase) {
                clearInterval(checkInterval);
                resolve(window.supabase);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                console.error(`❌ Supabase CDN loading timeout after ${timeout}ms`);
                reject(new Error(`Supabase CDN loading timeout after ${timeout}ms`));
            }
        }, 100);
    });
}

// Initialize Supabase client with CDN loading check
export async function initSupabase() {
    try {
        // Wait for Supabase CDN to load
        await waitForSupabase();
        
        // Create Supabase client
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Test connection
        const { data, error } = await supabase.from('assignments').select('count', { count: 'exact', head: true });
        
        if (error) {
            throw error;
        }
        
        return supabase;
        
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error.message || 'Unknown error');
        throw error;
    }
}

// Retry utility function
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 1.5; // Exponential backoff
        }
    }
}

// Get all assignments with retry logic
export async function getAllAssignments() {
    const fetchOperation = async () => {
        if (!supabase) {
            await initSupabase();
        }
        
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
    if (!supabase) {
        await initSupabase();
    }
    
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
    if (!supabase) {
        await initSupabase();
    }
    
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
    if (!supabase) {
        await initSupabase();
    }
    
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
                throw new Error('데이터베이스에서 ID 충돌이 발생했습니다. 관리자에게 문의하세요.');
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
    if (!supabase) {
        await initSupabase();
    }
    
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
    if (!supabase) {
        await initSupabase();
    }
    
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



// Transform database row to JavaScript object format
function transformDbToJs(dbRow) {
    return {
        id: dbRow.id,
        courseName: dbRow.course_name,
        round: dbRow.round,
        title: dbRow.title,
        dueDate: dbRow.due_date,
        dueTime: dbRow.due_time.substring(0, 5), // Remove seconds from time string
        platform: dbRow.platform,
        completed: dbRow.completed,
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at
    };
}

// Transform JavaScript object to database row format for INSERT (no id)
function transformJsToDbForInsert(jsObj) {
    return {
        course_name: jsObj.courseName,
        round: jsObj.round,
        title: jsObj.title,
        due_date: jsObj.dueDate,
        due_time: jsObj.dueTime,
        platform: jsObj.platform,
        completed: jsObj.completed || false
    };
}

// Transform JavaScript object to database row format for UPDATE (includes id)
function transformJsToDbForUpdate(jsObj) {
    const dbObj = transformJsToDbForInsert(jsObj);
    if (jsObj.id) {
        dbObj.id = jsObj.id;
    }
    return dbObj;
}

// Legacy function for backward compatibility
function transformJsToDb(jsObj) {
    return transformJsToDbForUpdate(jsObj);
}

