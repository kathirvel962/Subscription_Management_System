import { Response } from 'express';
import { UserService } from './userService.js';
import { CreateStaffSchema, UpdateProfileSchema } from './validation.js';
import { sendSuccess, sendError } from '../../../server/src/utils/responseHelper.js';
import { AuthenticatedRequest } from './authMiddleware.js';

export class UserController {
  static async getUsers(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string;
      const role = req.query.role as string;

      const result = await UserService.getUsers({ page, limit, search, role });
      return sendSuccess(res, result.users, 'Users retrieved successfully.', 200, result.meta);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async createStaff(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const parsed = CreateStaffSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const result = await UserService.createStaff(parsed.data);
      return sendSuccess(res, result, 'Staff account created successfully.', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getUserById(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const targetId = req.params.id;
      // Access check: Only Admin or the user themselves can view full user record
      if (req.user?.role !== 'ADMIN' && req.user?.id !== targetId) {
        return sendError(res, 'Access denied.', 403);
      }

      const result = await UserService.getUserById(targetId);
      return sendSuccess(res, result, 'User details retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const targetId = req.params.id;
      if (req.user?.role !== 'ADMIN' && req.user?.id !== targetId) {
        return sendError(res, 'Access denied.', 403);
      }

      const parsed = UpdateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const result = await UserService.updateProfile(targetId, parsed.data);
      return sendSuccess(res, result, 'Profile updated successfully.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getCustomers(_req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const customers = await UserService.getCustomers();
      return sendSuccess(res, customers, 'Customers retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}
