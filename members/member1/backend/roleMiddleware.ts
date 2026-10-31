import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';
import { sendError } from '../../../server/src/utils/responseHelper.js';

export function roleMiddleware(allowedRoles: string | string[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Requires one of the following roles: ${roles.join(', ')}.`,
        403
      );
    }

    return next();
  };
}

export const requireAdmin = roleMiddleware('ADMIN');
export const requireStaffOrAdmin = roleMiddleware(['ADMIN', 'STAFF']);
