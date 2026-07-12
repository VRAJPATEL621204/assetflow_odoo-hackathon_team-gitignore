const prisma = require('../config/prisma');

class AssetRepository {
  async count() {
    return prisma.asset.count();
  }

  async findByTag(tag) {
    return prisma.asset.findUnique({
      where: { tag },
      include: {
        category: {
          include: {
            customFields: true,
          },
        },
        location: true,
        department: true,
        fieldValues: {
          include: {
            customField: true,
          },
        },
      },
    });
  }

  async findById(id) {
    return prisma.asset.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        location: true,
        department: true,
        fieldValues: {
          include: {
            customField: true,
          },
        },
      },
    });
  }

  async findAll(filters = {}) {
    const where = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { tag: { contains: filters.search, mode: 'insensitive' } },
        { serialNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.categoryId) {
      where.categoryId = parseInt(filters.categoryId);
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.departmentId) {
      where.departmentId = parseInt(filters.departmentId);
    }

    if (filters.locationId) {
      where.locationId = parseInt(filters.locationId);
    }

    if (filters.isShared !== undefined) {
      where.isShared = filters.isShared === 'true' || filters.isShared === true;
    }

    return prisma.asset.findMany({
      where,
      include: {
        category: true,
        location: true,
        department: true,
      },
      orderBy: {
        tag: 'asc',
      },
    });
  }

  async create(data) {
    return prisma.$transaction(async (tx) => {
      // 1. Calculate tag sequentially
      const totalCount = await tx.asset.count();
      const tag = `AF-${String(totalCount + 1).padStart(4, '0')}`;

      // 2. Insert Asset record
      const asset = await tx.asset.create({
        data: {
          tag,
          name: data.name,
          serialNumber: data.serialNumber || null,
          acquisitionDate: new Date(data.acquisitionDate),
          acquisitionCost: data.acquisitionCost,
          condition: data.condition || 'GOOD',
          status: data.status || 'AVAILABLE',
          isShared: data.isShared || false,
          categoryId: parseInt(data.categoryId),
          departmentId: data.departmentId ? parseInt(data.departmentId) : null,
          locationId: data.locationId ? parseInt(data.locationId) : null,
        },
      });

      // 3. Create Custom Attributes values if provided
      if (data.fieldValues && typeof data.fieldValues === 'object') {
        for (const [customFieldIdStr, val] of Object.entries(data.fieldValues)) {
          const customFieldId = parseInt(customFieldIdStr);
          await tx.assetFieldValue.create({
            data: {
              assetId: asset.id,
              customFieldId,
              value: String(val),
            },
          });
        }
      }

      return tx.asset.findUnique({
        where: { id: asset.id },
        include: {
          category: true,
          location: true,
          department: true,
          fieldValues: {
            include: { customField: true },
          },
        },
      });
    });
  }

  async update(id, data) {
    return prisma.asset.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        serialNumber: data.serialNumber,
        condition: data.condition,
        status: data.status,
        isShared: data.isShared,
        locationId: data.locationId ? parseInt(data.locationId) : null,
        departmentId: data.departmentId ? parseInt(data.departmentId) : null,
      },
    });
  }
}

module.exports = new AssetRepository();
