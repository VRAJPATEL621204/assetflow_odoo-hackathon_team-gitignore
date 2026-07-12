const prisma = require('../config/prisma');

class UserRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        department: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async create(userData) {
    return prisma.$transaction(async (tx) => {
      // Find default EMPLOYEE role
      const employeeRole = await tx.role.findUnique({
        where: { name: 'EMPLOYEE' },
      });

      if (!employeeRole) {
        throw new Error('Default role EMPLOYEE not found in database');
      }

      // Create user
      const user = await tx.user.create({
        data: {
          email: userData.email,
          passwordHash: userData.passwordHash,
          name: userData.name,
          status: userData.status || 'ACTIVE',
          departmentId: userData.departmentId,
        },
      });

      // Assign role
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: employeeRole.id,
        },
      });

      return user;
    });
  }

  async updateRole(userId, roleId) {
    // Transaction to update role association
    return prisma.$transaction(async (tx) => {
      // Remove existing roles
      await tx.userRole.deleteMany({
        where: { userId },
      });

      // Assign new role
      return tx.userRole.create({
        data: {
          userId,
          roleId,
        },
      });
    });
  }
}

module.exports = new UserRepository();
