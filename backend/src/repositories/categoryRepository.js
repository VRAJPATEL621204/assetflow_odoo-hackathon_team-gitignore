const prisma = require('../config/prisma');

class CategoryRepository {
  async findAll() {
    return prisma.assetCategory.findMany({
      include: {
        customFields: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findByName(name) {
    return prisma.assetCategory.findUnique({
      where: { name },
    });
  }

  async create(data) {
    return prisma.$transaction(async (tx) => {
      // Create category
      const category = await tx.assetCategory.create({
        data: {
          name: data.name,
        },
      });

      // Create custom fields if provided
      if (data.customFields && Array.isArray(data.customFields)) {
        for (const field of data.customFields) {
          await tx.assetCustomField.create({
            data: {
              categoryId: category.id,
              fieldName: field.fieldName,
              fieldType: field.fieldType || 'string',
              isRequired: field.isRequired || false,
            },
          });
        }
      }

      // Return fully loaded category
      return tx.assetCategory.findUnique({
        where: { id: category.id },
        include: { customFields: true },
      });
    });
  }
}

module.exports = new CategoryRepository();
