// Data transformation utilities for converting between JavaScript objects and database rows

import type { Assignment } from './utils';

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
  link?: string;
  memo?: string;
}

interface DbAssignmentInsert {
  course_name: string;
  round: string;
  title: string;
  due_date: string;
  due_time: string;
  platform: 'teams' | 'openlms';
  completed: boolean;
  link?: string;
  memo?: string;
}

interface DbAssignmentUpdate {
  course_name?: string;
  round?: string;
  title?: string;
  due_date?: string;
  due_time?: string;
  platform?: 'teams' | 'openlms';
  completed?: boolean;
  link?: string;
  memo?: string;
}

// Transform database row to JavaScript object format
export function transformDbToJs(dbRow: DbAssignment): Assignment {
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
    updatedAt: dbRow.updated_at,
    link: dbRow.link,
    memo: dbRow.memo
  };
}

// Transform JavaScript object to database row format for INSERT (no id)
export function transformJsToDbForInsert(jsObj: Omit<Assignment, 'id'>): DbAssignmentInsert {
  return {
    course_name: jsObj.courseName,
    round: jsObj.round,
    title: jsObj.title,
    due_date: jsObj.dueDate,
    due_time: jsObj.dueTime,
    platform: jsObj.platform,
    completed: jsObj.completed || false,
    link: jsObj.link,
    memo: jsObj.memo
  };
}

// Transform JavaScript object to database row format for UPDATE
export function transformJsToDbForUpdate(jsObj: Partial<Assignment>): DbAssignmentUpdate {
  const dbObj: DbAssignmentUpdate = {};
  
  if (jsObj.courseName !== undefined) dbObj.course_name = jsObj.courseName;
  if (jsObj.round !== undefined) dbObj.round = jsObj.round;
  if (jsObj.title !== undefined) dbObj.title = jsObj.title;
  if (jsObj.dueDate !== undefined) dbObj.due_date = jsObj.dueDate;
  if (jsObj.dueTime !== undefined) dbObj.due_time = jsObj.dueTime;
  if (jsObj.platform !== undefined) dbObj.platform = jsObj.platform;
  if (jsObj.completed !== undefined) dbObj.completed = jsObj.completed;
  if (jsObj.link !== undefined) dbObj.link = jsObj.link;
  if (jsObj.memo !== undefined) dbObj.memo = jsObj.memo;
  
  return dbObj;
}