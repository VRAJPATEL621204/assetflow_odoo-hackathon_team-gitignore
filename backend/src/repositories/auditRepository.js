const prisma = require('../config/prisma');

class AuditRepository {
  async findAllCycles() {
    return prisma.auditCycle.findMany({
      include: {
        auditors: {
          include: {
            auditor: true,
          },
        },
        verifications: true,
        discrepancies: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async findCycleById(id) {
    return prisma.auditCycle.findUnique({
      where: { id: parseInt(id) },
      include: {
        auditors: true,
        verifications: true,
        discrepancies: true,
      },
    });
  }

  async createCycle(data) {
    return prisma.$transaction(async (tx) => {
      // 1. Create Cycle
      const cycle = await tx.auditCycle.create({
        data: {
          name: data.name,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          status: 'SCHEDULED',
        },
      });

      // 2. Map Auditors
      if (data.auditorIds && Array.isArray(data.auditorIds)) {
        for (const auditorId of data.auditorIds) {
          await tx.auditAssignment.create({
            data: {
              auditCycleId: cycle.id,
              auditorId: parseInt(auditorId),
            },
          });
        }
      }

      return tx.auditCycle.findUnique({
        where: { id: cycle.id },
        include: { auditors: true },
      });
    });
  }

  async recordVerification(data) {
    return prisma.$transaction(async (tx) => {
      // 1. Create or Update Verification
      const verification = await tx.auditVerification.upsert({
        where: {
          auditCycleId_assetId: {
            auditCycleId: parseInt(data.auditCycleId),
            assetId: parseInt(data.assetId),
          },
        },
        update: {
          status: data.status,
          auditorId: parseInt(data.auditorId),
          notes: data.notes,
        },
        create: {
          auditCycleId: parseInt(data.auditCycleId),
          assetId: parseInt(data.assetId),
          auditorId: parseInt(data.auditorId),
          status: data.status,
          notes: data.notes,
        },
      });

      // 2. Generate or Update Discrepancy if MISSING or DAMAGED
      if (data.status === 'MISSING' || data.status === 'DAMAGED') {
        await tx.auditDiscrepancy.upsert({
          where: {
            auditCycleId_assetId: {
              auditCycleId: parseInt(data.auditCycleId),
              assetId: parseInt(data.assetId),
            },
          },
          update: {
            issueType: data.status,
            notes: data.notes,
          },
          create: {
            auditCycleId: parseInt(data.auditCycleId),
            assetId: parseInt(data.assetId),
            issueType: data.status,
            notes: data.notes,
            resolved: false,
          },
        });
      } else if (data.status === 'VERIFIED') {
        // If corrected to Verified, remove any previous discrepancies
        await tx.auditDiscrepancy.deleteMany({
          where: {
            auditCycleId: parseInt(data.auditCycleId),
            assetId: parseInt(data.assetId),
          },
        });
      }

      return verification;
    });
  }

  async closeCycle(id) {
    return prisma.$transaction(async (tx) => {
      // 1. Update cycle status
      const cycle = await tx.auditCycle.update({
        where: { id: parseInt(id) },
        data: { status: 'CLOSED' },
        include: {
          verifications: true,
        },
      });

      // 2. Lock and apply statuses to affected assets
      for (const verification of cycle.verifications) {
        if (verification.status === 'MISSING') {
          await tx.asset.update({
            where: { id: verification.assetId },
            data: { status: 'LOST' },
          });
        }
      }

      return cycle;
    });
  }
}

module.exports = new AuditRepository();
