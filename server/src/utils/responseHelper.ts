import { Response } from 'express';
import { ApiResponse } from '../../../shared/types/index.js';

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  error: string,
  statusCode: number = 400,
  errors?: Record<string, string[]>
): Response {
  const payload: ApiResponse = {
    success: false,
    error,
    errors,
  };
  return res.status(statusCode).json(payload);
}
