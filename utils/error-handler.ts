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
  const logMessage = `❌ ${error.context.operation} 실패: ${error.message}`;
  console.error(logMessage, {
    type: error.type,
    context: error.context,
    originalError: error.originalError
  });
}

export function handleDatabaseError(error: unknown, context: ErrorContext): AppError {
  const err = error as any;
  
  // Supabase specific error codes
  if (err?.code === '23505') {
    return createAppError(
      ErrorType.DATABASE,
      'Primary key conflict detected',
      'ID 충돌이 발생했습니다. 관리자에게 문의하세요.',
      context,
      err
    );
  }
  
  if (err?.code === 'PGRST116') {
    return createAppError(
      ErrorType.DATABASE,
      'Record not found',
      '요청한 데이터를 찾을 수 없습니다.',
      context,
      err
    );
  }
  
  // Network related errors
  if (err?.message?.includes('network') || err?.message?.includes('fetch')) {
    return createAppError(
      ErrorType.NETWORK,
      'Network connection failed',
      '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.',
      context,
      err
    );
  }
  
  // Generic database error
  return createAppError(
    ErrorType.DATABASE,
    err?.message || 'Database operation failed',
    '데이터베이스 작업에 실패했습니다. 잠시 후 다시 시도해주세요.',
    context,
    err
  );
}

export function handleError(error: unknown, context: ErrorContext): AppError {
  if (error instanceof Error) {
    return handleDatabaseError(error, context);
  }
  
  return createAppError(
    ErrorType.UNKNOWN,
    'Unknown error occurred',
    '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
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