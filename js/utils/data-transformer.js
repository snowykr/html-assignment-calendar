// Data transformation utilities for converting between JavaScript objects and database rows

// Transform database row to JavaScript object format
export function transformDbToJs(dbRow) {
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
export function transformJsToDbForInsert(jsObj) {
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

// Transform JavaScript object to database row format for UPDATE
export function transformJsToDbForUpdate(jsObj) {
    const dbObj = {
        course_name: jsObj.courseName,
        round: jsObj.round,
        title: jsObj.title,
        due_date: jsObj.dueDate,
        due_time: jsObj.dueTime,
        platform: jsObj.platform,
        completed: jsObj.completed
    };
    
    // Remove undefined values
    Object.keys(dbObj).forEach(key => {
        if (dbObj[key] === undefined) {
            delete dbObj[key];
        }
    });
    
    return dbObj;
}