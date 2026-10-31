const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');
const { validatePasswordStrength } = require('./authController');

/**
 * @desc    Get list of users (Admin sees all; Staff sees customers)
 * @route   GET /api/users
 * @access  Private (Admin, Staff)
 */
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Staff can only view customers
    if (req.user.role === 'staff') {
      query.role = 'customer';
    } else if (req.query.role) {
      query.role = req.query.role;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);

    return successResponse(res, 200, 'Users retrieved successfully', {
      users: users.map((u) => u.toSafeObject()),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new user account (Staff/Admin/Customer)
 * @route   POST /api/users
 * @access  Private (Admin only)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'staff', isActive = true } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email, and password.');
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return errorResponse(res, 400, passwordError);
    }

    const validRoles = ['admin', 'staff', 'customer'];
    if (!validRoles.includes(role)) {
      return errorResponse(res, 400, `Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return errorResponse(res, 409, 'A user with this email already exists.');
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      isActive
    });

    return successResponse(res, 201, 'User created successfully', {
      user: user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private (Admin, Staff for customers, Customer for self)
 */
const getUserById = async (req, res, next) => {
  try {
    const targetId = req.params.id;

    // Customer can only access their own user info
    if (req.user.role === 'customer' && req.user._id.toString() !== targetId) {
      return errorResponse(res, 403, 'Forbidden. You may only view your own account.');
    }

    const user = await User.findById(targetId);
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    // Staff cannot view other staff or admin accounts
    if (req.user.role === 'staff' && user.role !== 'customer' && req.user._id.toString() !== targetId) {
      return errorResponse(res, 403, 'Forbidden. Staff can only access customer profiles.');
    }

    return successResponse(res, 200, 'User retrieved successfully', {
      user: user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update user details or status
 * @route   PATCH /api/users/:id
 * @access  Private (Admin can update all; Others can only update their own profile name)
 */
const updateUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const isSelf = req.user._id.toString() === targetId;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isSelf) {
      return errorResponse(res, 403, 'Forbidden. You do not have permission to update this user.');
    }

    const user = await User.findById(targetId);
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    const { name, email, role, isActive, password } = req.body;

    if (name) user.name = name.trim();

    if (email && email.trim().toLowerCase() !== user.email) {
      const normalizedEmail = email.trim().toLowerCase();
      const duplicate = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (duplicate) {
        return errorResponse(res, 409, 'Email is already in use by another account.');
      }
      user.email = normalizedEmail;
    }

    // Only Admin can change roles and active status
    if (isAdmin) {
      if (role && ['admin', 'staff', 'customer'].includes(role)) {
        user.role = role;
      }
      if (isActive !== undefined) {
        user.isActive = Boolean(isActive);
      }
    }

    // If password update requested
    if (password) {
      const passwordError = validatePasswordStrength(password);
      if (passwordError) {
        return errorResponse(res, 400, passwordError);
      }
      user.password = password; // Will be hashed by pre-save hook
    }

    await user.save();

    return successResponse(res, 200, 'User updated successfully', {
      user: user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUser
};
