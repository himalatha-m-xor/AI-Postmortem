// Custom error classes and error handling utilities

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export class AIGenerationError extends AppError {
  constructor(message: string = 'Failed to generate postmortem') {
    super(message, 500, 'AI_GENERATION_ERROR');
    this.name = 'AIGenerationError';
  }
}

// Error response format
export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: any;
  };
}

// Convert error to response format
export function formatErrorResponse(error: Error | AppError): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
    };
  }

  // For unknown errors, don't expose details in production
  const isDev = process.env.NODE_ENV === 'development';

  return {
    error: {
      message: isDev ? error.message : 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      details: isDev ? error.stack : undefined,
    },
  };
}

// Async error handler wrapper
export function asyncHandler<T>(
  fn: (...args: any[]) => Promise<T>
): (...args: any[]) => Promise<T> {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // Wrap unknown errors
      throw new AppError(
        error instanceof Error ? error.message : 'Unknown error',
        500
      );
    }
  };
}
