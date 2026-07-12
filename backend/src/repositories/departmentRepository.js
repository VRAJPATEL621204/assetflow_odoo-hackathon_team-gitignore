const prisma = require('../config/prisma');

class DepartmentRepository {
  async findAll() {
    return prisma.department.findMany({
      include: {
        parent: true,
        employees: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id) {
    return prisma.department.findUnique({
      where: { id: parseInt(id) },
      include: {
        parent: true,
      },
    });
  }

  async create(data) {
    return prisma.department.create({
      data: {
        name: data.name,
        parentId: data.parentId ? parseInt(data.parentId) : null,
        status: data.status || 'ACTIVE',
      },
    });
  }

  async update(id, data) {
    return prisma.department.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        parentId: data.parentId ? parseInt(data.parentId) : null,
        status: data.status,
      },
    });
  }
}

module.exports = new DepartmentRepository();
