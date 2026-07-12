const maintenanceRepository = require('../repositories/maintenanceRepository');
const { logActivity, createNotification } = require('../utils/activity');
const prisma = require('../config/prisma');

class MaintenanceService {
  async getRequests() {
    return maintenanceRepository.findAllRequests();
  }

  async createRequest(userId, data) {
    const request = await maintenanceRepository.createRequest({
      assetId: data.assetId,
      raisedById: userId,
      description: data.description,
      priority: data.priority,
    });

    await logActivity(
      userId,
      'MAINTENANCE_CREATE',
      'maintenance_request',
      request.id,
      `Reported asset repair request: "${data.description}"`
    );

    return request;
  }

  async getTechnicians() {
    return maintenanceRepository.getTechnicians();
  }

  async updateRequest(userId, id, data) {
    const request = await maintenanceRepository.findRequestById(id);
    if (!request) {
      throw new Error('Maintenance request not found');
    }

    // Process update & update asset status in transaction
    const extra = {
      approvedById: userId,
      technicianId: data.technicianId,
      actionTaken: data.actionTaken,
      partsReplaced: data.partsReplaced,
      cost: data.cost,
    };

    const updated = await maintenanceRepository.updateRequestStatus(id, data.status, extra);

    // Log Activity & Create Notifications
    await logActivity(
      userId,
      'MAINTENANCE_UPDATE',
      'maintenance_request',
      updated.id,
      `Set status to ${data.status} for request ID ${updated.id}`
    );

    // Notify original raising employee of status changes
    await createNotification(
      updated.raisedById,
      'GENERAL',
      `Your repair request for asset ID ${updated.assetId} has been updated to ${data.status}.`
    );

    return updated;
  }

  async createTechnician(data) {
    return prisma.technician.create({
      data: {
        name: data.name,
        email: data.email,
        specialty: data.specialty,
        status: 'ACTIVE',
      },
    });
  }
}

module.exports = new MaintenanceService();
