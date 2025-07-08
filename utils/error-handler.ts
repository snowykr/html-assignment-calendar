// Common error handling utilities

export interface ErrorContext {
  operation: string;
  userId?: string;
  assignmentId?: number;
  additionalInfo?: Record<string, unknown>;
}

export enum ErrorType {
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  VALIDATION = 'VALIDATION',
  AUTHORIZATION = 'AUTHORIZATION',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  context: ErrorContext;
  originalError?: Error;
}

export function createAppError(
  type: ErrorType,
  message: string,
  userMessage: string,
  context: ErrorContext,
  originalError?: Error
): AppError {
  return {
    type,
    message,
    userMessage,
    context,
    originalError
  };
}

export function logError(error: AppError): void {
  const logMessage = `❌ Operation ${error.context.operation} failed: ${error.message}`;
  console.error(logMessage, {
    type: error.type,
    context: error.context,
    originalError: error.originalError
  });
}

export function handleDatabaseError(error: unknown, context: ErrorContext, t: (key: string) => string): AppError {
  const err = error as any;
  
  // Supabase specific error codes
  if (err?.code === '23505') {
    return createAppError(
      ErrorType.DATABASE,
      'Primary key conflict detected',
      t('conflictError'),
      context,
      err
    );
  }
  
  if (err?.code === 'PGRST116') {
    return createAppError(
      ErrorType.DATABASE,
      'Record not found',
      t('notFoundError'),
      context,
      err
    );
  }
  
  // Network related errors
  if (err?.message?.includes('network') || err?.message?.includes('fetch')) {
    return createAppError(
      ErrorType.NETWORK,
      'Network connection failed',
      t('networkError'),
      context,
      err
    );
  }
  
  // Generic database error
  return createAppError(
    ErrorType.DATABASE,
    err?.message || 'Database operation failed',
    t('databaseError'),
    context,
    err
  );
}

export function handleError(error: unknown, context: ErrorContext, t: (key: string) => string): AppError {
  if (error instanceof Error) {
    return handleDatabaseError(error, context, t);
  }
  
  return createAppError(
    ErrorType.UNKNOWN,
    'Unknown error occurred',
    t('unknownError'),
    context
  );
}

export function showUserError(error: AppError, showToast?: (message: string) => void): void {
  if (showToast) {
    showToast(error.userMessage);
  } else {
    alert(error.userMessage);
  }
}