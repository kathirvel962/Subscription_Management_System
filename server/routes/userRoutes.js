const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  getUserById,
  updateUser
} = require('../controllers/userController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All user routes require authentication
router.use(authenticateUser);

// List users: Admin and Staff only
router.get('/', authorizeRoles('admin', 'staff'), getUsers);

// Create user (staff/admin): Admin only
router.post('/', authorizeRoles('admin'), createUser);

// Get single user by ID: Admin, Staff, or Self (checked inside controller)
router.get('/:id', getUserById);

// Update user by ID: Admin or Self (checked inside controller)
router.patch('/:id', updateUser);

module.exports = router;
