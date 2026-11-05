import { Response } from 'express';
import { ApiResponse } from '@devblueprint/types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: ApiResponse<T>['meta']
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  code?: string,
  details?: any
): Response {
  const payload: ApiResponse = {
    success: false,
    message,
    error: {
      code,
      details
    }
  };
  return res.status(statusCode).json(payload);
}

