// Data transformation utilities for converting between JavaScript objects and database rows

import type { Assignment } from './utils';

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

interface DbAssignmentInsert {
  course_name: string;
  lesson: string;
  title: string;
  due_date: string;
  due_time: string;
  platform: 'teams' | 'openlms';
  completed: boolean;
  user_id: string;
  link?: string;
  memo?: string;
}

interface DbAssignmentUpdate {
  course_name?: string;
  lesson?: string;
  title?: string;
  due_date?: string;
  due_time?: string;
  platform?: 'teams' | 'openlms';
  completed?: boolean;
  user_id?: string;
  link?: string;
  memo?: string;
}

// Transform database row to JavaScript object format
export function transformDbToJs(dbRow: DbAssignment): Assignment {
  return {
    id: dbRow.id,
    courseName: dbRow.course_name,
    lesson: dbRow.lesson,
    title: dbRow.title,
    dueDate: dbRow.due_date,
    dueTime: dbRow.due_time.substring(0, 5), // Remove seconds from time string
    platform: dbRow.platform,
    completed: dbRow.completed,
    userId: dbRow.user_id,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at,
    link: dbRow.link,
    memo: dbRow.memo
  };
}

// Transform JavaScript object to database row format for INSERT (no id)
export function transformJsToDbForInsert(jsObj: Omit<Assignment, 'id'>): DbAssignmentInsert {
  if (!jsObj.userId) {
    throw new Error('userId is required for creating assignments');
  }
  
  return {
    course_name: jsObj.courseName,
    lesson: jsObj.lesson,
    title: jsObj.title,
    due_date: jsObj.dueDate,
    due_time: jsObj.dueTime,
    platform: jsObj.platform,
    completed: jsObj.completed || false,
    user_id: jsObj.userId,
    link: jsObj.link,
    memo: jsObj.memo
  };
}

// Transform JavaScript object to database row format for UPDATE
export function transformJsToDbForUpdate(jsObj: Partial<Assignment>): DbAssignmentUpdate {
  const dbObj: DbAssignmentUpdate = {};
  
  if (jsObj.courseName !== undefined) dbObj.course_name = jsObj.courseName;
  if (jsObj.lesson !== undefined) dbObj.lesson = jsObj.lesson;
  if (jsObj.title !== undefined) dbObj.title = jsObj.title;
  if (jsObj.dueDate !== undefined) dbObj.due_date = jsObj.dueDate;
  if (jsObj.dueTime !== undefined) dbObj.due_time = jsObj.dueTime;
  if (jsObj.platform !== undefined) dbObj.platform = jsObj.platform;
  if (jsObj.completed !== undefined) dbObj.completed = jsObj.completed;
  if (jsObj.userId !== undefined) dbObj.user_id = jsObj.userId;
  if (jsObj.link !== undefined) dbObj.link = jsObj.link;
  if (jsObj.memo !== undefined) dbObj.memo = jsObj.memo;
  
  return dbObj;
}