const { errorResponse } = require('../utils/response');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts access to routes based on user role(s).
 * @param  {...string} roles - Permitted roles (e.g. 'admin', 'staff', 'customer')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};

module.exports = {
  authorizeRoles
};
