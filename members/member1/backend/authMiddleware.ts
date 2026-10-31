import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../../server/src/config/db.js';
import { ENV } from '../../../server/src/config/env.js';
import { sendError } from '../../../server/src/utils/responseHelper.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
    customerProfileId?: string | null;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required. No Bearer token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      name: string;
    };

    const user = await db.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || !user.isActive) {
      return sendError(res, 'User session invalid or account deactivated.', 401);
    }

    let customerProfileId = null;
    if (user.role === 'CUSTOMER') {
      const profile = await db.customerProfile.findUnique({
        where: { userId: user.id },
      });
      customerProfileId = profile?.id || null;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      customerProfileId,
    };

    return next();
  } catch (err: any) {
    return sendError(res, 'Invalid or expired session token.', 401);
  }
}
