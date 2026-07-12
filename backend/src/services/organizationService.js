const departmentRepository = require('../repositories/departmentRepository');
const categoryRepository = require('../repositories/categoryRepository');
const userRepository = require('../repositories/userRepository');
const prisma = require('../config/prisma');

class OrganizationService {
  // --- Departments ---
  async getDepartments() {
    return departmentRepository.findAll();
  }

  async createDepartment(data) {
    if (data.parentId) {
      const parent = await departmentRepository.findById(data.parentId);
      if (!parent) {
        throw new Error('Parent department not found');
      }
    }
    return departmentRepository.create(data);
  }

  async updateDepartment(id, data) {
    const existing = await departmentRepository.findById(id);
    if (!existing) {
      throw new Error('Department not found');
    }
    return departmentRepository.update(id, data);
  }

  // --- Asset Categories ---
  async getCategories() {
    return categoryRepository.findAll();
  }

  async createCategory(data) {
    const existing = await categoryRepository.findByName(data.name);
    if (existing) {
      throw new Error('Asset category already exists');
    }
    return categoryRepository.create(data);
  }

  // --- Employee Directory & Promotions ---
  async getEmployees() {
    // Return all users with roles and department info
    return prisma.user.findMany({
      include: {
        department: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async promoteEmployee(userId, { roleName }) {
    const targetRole = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!targetRole) {
      throw new Error(`Role ${roleName} does not exist in seed metadata`);
    }

    const user = await userRepository.findById(parseInt(userId));
    if (!user) {
      throw new Error('User not found');
    }

    // Update role association
    await userRepository.updateRole(parseInt(userId), targetRole.id);

    // If role promoted to DEPT_HEAD and user has a department, we can also link them
    const updatedUser = await userRepository.findById(parseInt(userId));
    return updatedUser;
  }

  async getLocations() {
    return prisma.location.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createLocation(data) {
    return prisma.location.create({
      data: {
        name: data.name,
        address: data.address || null,
      },
    });
  }
}

module.exports = new OrganizationService();
