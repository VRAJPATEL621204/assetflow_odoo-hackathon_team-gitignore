const { z } = require('zod');
const userService = require('../services/userService');

// Zod validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must not exceed 50 characters'),
  email: z.string().email('Invalid email address').max(100, 'Email must not exceed 100 characters').transform(val => val.toLowerCase().trim()),
  password: z.string().min(6, 'Password must be at least 6 characters').max(24, 'Password must not exceed 24 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(100, 'Email must not exceed 100 characters').transform(val => val.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required').max(24, 'Password must not exceed 24 characters'),
});

class UserController {
  register = async (req, res, next) => {
    try {
      // Input Validation
      const validatedData = registerSchema.parse(req.body);

      // Business execution
      const user = await userService.registerUser(validatedData);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: user,
      });
    } catch (error) {
      next(error); // Pass to Express global error handler
    }
  };

  login = async (req, res, next) => {
    try {
      // Input Validation
      const validatedData = loginSchema.parse(req.body);

      // Business execution
      const authResult = await userService.authenticateUser(validatedData);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: authResult,
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req, res, next) => {
    try {
      // req.user is set by authMiddleware
      const user = await userService.getUserProfile(req.user.id);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new UserController();
