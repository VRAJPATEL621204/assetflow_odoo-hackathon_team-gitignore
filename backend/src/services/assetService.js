const assetRepository = require('../repositories/assetRepository');
const prisma = require('../config/prisma');
const { logActivity } = require('../utils/activity');

class AssetService {
  async getAssets(filters) {
    return assetRepository.findAll(filters);
  }

  async getAssetById(id) {
    const asset = await assetRepository.findById(id);
    if (!asset) {
      throw new Error('Asset not found');
    }
    return asset;
  }

  async getAssetByTag(tag) {
    const asset = await assetRepository.findByTag(tag);
    if (!asset) {
      throw new Error('Asset not found');
    }
    return asset;
  }

  async registerAsset(userId, data) {
    // 1. Validate category existence and its required custom fields schema
    const category = await prisma.assetCategory.findUnique({
      where: { id: parseInt(data.categoryId) },
      include: { customFields: true },
    });

    if (!category) {
      throw new Error('Asset category not found');
    }

    // 2. Validate custom fields constraints
    const fieldValues = data.fieldValues || {};
    for (const field of category.customFields) {
      const val = fieldValues[field.id];
      if (field.isRequired && (val === undefined || val === null || val === '')) {
        throw new Error(`Custom field "${field.fieldName}" is required for category "${category.name}"`);
      }
    }

    // 3. Register asset
    const asset = await assetRepository.create(data);

    // 4. Record audit trail
    await logActivity(
      userId,
      'ASSET_CREATE',
      'asset',
      asset.id,
      `Registered asset "${asset.name}" with tag "${asset.tag}"`
    );

    return asset;
  }

  async updateAsset(userId, id, data) {
    const asset = await assetRepository.update(id, data);

    await logActivity(
      userId,
      'ASSET_UPDATE',
      'asset',
      asset.id,
      `Updated asset details for "${asset.name}"`
    );

    return asset;
  }
}

module.exports = new AssetService();
