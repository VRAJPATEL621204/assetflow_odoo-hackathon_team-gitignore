const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

class UserService {
  async registerUser({ name, email, password }) {
    // 1. Business Validation
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // 2. Security: Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Save User
    const newUser = await userRepository.create({
      name,
      email,
      passwordHash,
    });

    // Clean user object before return (omit password hash)
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async authenticateUser({ email, password }) {
    // 1. Retrieve User with roles and permissions
    const user = await userRepository.findByEmail(email);
    if (!user || user.status !== 'ACTIVE') {
      throw new Error('Invalid email or credentials');
    }

    // 2. Validate Password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or credentials');
    }

    // 3. Generate JWT
    const roles = user.userRoles.map(ur => ur.role.name);
    const permissions = user.userRoles.flatMap(ur =>
      ur.role.rolePermissions.map(rp => rp.permission.name)
    );

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        roles,
        permissions,
      },
      process.env.JWT_SECRET || 'fallback_secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles,
        permissions,
      },
    };
  }

  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = new UserService();
