const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'subscriptiq_super_secret_jwt_key_2026_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id: userId, role }, secret, { expiresIn });
};

/**
 * Validate password requirements according to SubscriptIQ business rules:
 * - More than 8 characters (i.e. >= 9 chars)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one special character
 */
const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }
  if (password.length <= 8) {
    return 'Password must be longer than 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
};

/**
 * @desc    Register a new customer account
 * @route   POST /api/auth/register
 * @access  Public
 * @note    Public registration ALWAYS creates a customer account.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email, and password.');
    }

    // Validate password rules
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return errorResponse(res, 400, passwordError);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing user with this email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return errorResponse(res, 409, 'An account with this email address already exists.');
    }

    // Security: Public registration must NEVER create an admin or staff account
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'customer', // strictly enforced
      isActive: true
    });

    const token = generateToken(user._id, user.role);

    return successResponse(res, 201, 'Registration successful', {
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide both email and password.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Explicitly select password for comparison
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      return errorResponse(
        res,
        403,
        'Your account has been deactivated. Please contact an administrator.'
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    const token = generateToken(user._id, user.role);

    return successResponse(res, 200, 'Login successful', {
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current authenticated user info
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'User profile fetched successfully', {
      user: req.user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  validatePasswordStrength
};
