import { Request, Response } from 'express';
import { AuthService } from './authService.js';
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from './validation.js';
import { sendSuccess, sendError } from '../../../server/src/utils/responseHelper.js';
import { AuthenticatedRequest } from './authMiddleware.js';

export class AuthController {
  static async register(req: Request, res: Response): Promise<any> {
    try {
      const parsed = RegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const result = await AuthService.register(parsed.data);
      return sendSuccess(res, result, 'Registration successful.', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async login(req: Request, res: Response): Promise<any> {
    try {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const result = await AuthService.login(parsed.data.email, parsed.data.password);
      return sendSuccess(res, result, 'Login successful.');
    } catch (err: any) {
      return sendError(res, err.message, 401);
    }
  }

  static async logout(_req: Request, res: Response): Promise<any> {
    return sendSuccess(res, null, 'Logged out successfully.');
  }

  static async forgotPassword(req: Request, res: Response): Promise<any> {
    try {
      const parsed = ForgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const result = await AuthService.forgotPassword(parsed.data.email);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<any> {
    try {
      const parsed = ResetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const result = await AuthService.resetPassword(parsed.data.token, parsed.data.password);
      return sendSuccess(res, null, result.message);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response): Promise<any> {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }
    return sendSuccess(res, req.user, 'Current session retrieved.');
  }
}
