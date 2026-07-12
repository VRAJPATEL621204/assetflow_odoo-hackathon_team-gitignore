const auditRepository = require('../repositories/auditRepository');
const { logActivity } = require('../utils/activity');

class AuditService {
  async getCycles() {
    return auditRepository.findAllCycles();
  }

  async createCycle(userId, data) {
    const cycle = await auditRepository.createCycle(data);
    await logActivity(userId, 'AUDIT_CYCLE_CREATE', 'audit_cycle', cycle.id, `Scheduled audit cycle "${cycle.name}"`);
    return cycle;
  }

  async verifyAsset(userId, data) {
    // 1. Fetch Cycle and check lock status
    const cycle = await auditRepository.findCycleById(data.auditCycleId);
    if (!cycle) {
      throw new Error('Audit cycle not found');
    }
    if (cycle.status === 'CLOSED') {
      throw new Error('This audit cycle has been closed and locked. No further modifications are allowed.');
    }

    const verification = await auditRepository.recordVerification({
      auditCycleId: data.auditCycleId,
      assetId: data.assetId,
      auditorId: userId,
      status: data.status,
      notes: data.notes,
    });

    await logActivity(
      userId,
      'AUDIT_VERIFY',
      'audit_verification',
      verification.id,
      `Verified asset ID ${data.assetId} as ${data.status}`
    );

    return verification;
  }

  async closeCycle(userId, id) {
    const cycle = await auditRepository.findCycleById(id);
    if (!cycle) {
      throw new Error('Audit cycle not found');
    }
    if (cycle.status === 'CLOSED') {
      throw new Error('Audit cycle is already closed');
    }

    const closedCycle = await auditRepository.closeCycle(id);
    await logActivity(userId, 'AUDIT_CYCLE_CLOSE', 'audit_cycle', closedCycle.id, `Closed and locked audit cycle`);

    return closedCycle;
  }
}

module.exports = new AuditService();
