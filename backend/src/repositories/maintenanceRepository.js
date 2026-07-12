const prisma = require('../config/prisma');

class MaintenanceRepository {
  async findAllRequests() {
    return prisma.maintenanceRequest.findMany({
      include: {
        asset: true,
        raisedByUser: true,
        technician: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findRequestById(id) {
    return prisma.maintenanceRequest.findUnique({
      where: { id: parseInt(id) },
      include: { asset: true },
    });
  }

  async createRequest(data) {
    return prisma.maintenanceRequest.create({
      data: {
        assetId: parseInt(data.assetId),
        raisedById: parseInt(data.raisedById),
        description: data.description,
        priority: data.priority || 'MEDIUM',
        status: 'PENDING',
      },
    });
  }

  async updateRequestStatus(id, status, extra = {}) {
    return prisma.$transaction(async (tx) => {
      // 1. Update Request
      const updatedRequest = await tx.maintenanceRequest.update({
        where: { id: parseInt(id) },
        data: {
          status,
          approvedById: extra.approvedById ? parseInt(extra.approvedById) : undefined,
          technicianId: extra.technicianId ? parseInt(extra.technicianId) : undefined,
        },
      });

      // 2. Sync Asset Status based on request state
      if (status === 'APPROVED' || status === 'IN_PROGRESS') {
        await tx.asset.update({
          where: { id: updatedRequest.assetId },
          data: { status: 'UNDER_MAINTENANCE' },
        });
      } else if (status === 'RESOLVED') {
        await tx.asset.update({
          where: { id: updatedRequest.assetId },
          data: { status: 'AVAILABLE' },
        });
      } else if (status === 'REJECTED') {
        // If rejected, asset goes back to AVAILABLE (assuming it was available or check-in completed)
        await tx.asset.update({
          where: { id: updatedRequest.assetId },
          data: { status: 'AVAILABLE' },
        });
      }

      // 3. Create Maintenance Log record if action details provided
      if (extra.actionTaken) {
        await tx.maintenanceLog.create({
          data: {
            maintenanceRequestId: updatedRequest.id,
            actionTaken: extra.actionTaken,
            partsReplaced: extra.partsReplaced || null,
            cost: extra.cost || 0.00,
          },
        });
      }

      return updatedRequest;
    });
  }

  async getTechnicians() {
    return prisma.technician.findMany({
      where: { status: 'ACTIVE' },
    });
  }
}

module.exports = new MaintenanceRepository();
