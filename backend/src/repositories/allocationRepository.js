const prisma = require('../config/prisma');

class AllocationRepository {
  async findActiveAllocationByAssetId(assetId) {
    return prisma.assetAllocation.findFirst({
      where: {
        assetId: parseInt(assetId),
        status: 'ACTIVE',
      },
      include: {
        employee: true,
        department: true,
      },
    });
  }

  async findAllocationById(id) {
    return prisma.assetAllocation.findUnique({
      where: { id: parseInt(id) },
      include: {
        asset: true,
        employee: true,
        department: true,
      },
    });
  }

  async findAllAllocations() {
    return prisma.assetAllocation.findMany({
      include: {
        asset: true,
        employee: true,
        department: true,
      },
      orderBy: {
        allocatedDate: 'desc',
      },
    });
  }

  async createAllocation(data) {
    return prisma.$transaction(async (tx) => {
      // 1. Create Allocation record
      const allocation = await tx.assetAllocation.create({
        data: {
          assetId: parseInt(data.assetId),
          employeeId: data.employeeId ? parseInt(data.employeeId) : null,
          departmentId: data.departmentId ? parseInt(data.departmentId) : null,
          expectedReturnDate: data.expectedReturnDate ? new Date(data.expectedReturnDate) : null,
          status: 'ACTIVE',
        },
      });

      // 2. Update Asset status to ALLOCATED
      await tx.asset.update({
        where: { id: parseInt(data.assetId) },
        data: { status: 'ALLOCATED' },
      });

      // 3. Log History
      await tx.allocationHistory.create({
        data: {
          assetAllocationId: allocation.id,
          action: 'CREATE',
          details: `Allocated to ${data.employeeId ? 'employee ' + data.employeeId : 'department ' + data.departmentId}`,
        },
      });

      return allocation;
    });
  }

  async returnAllocation(id, returnData) {
    return prisma.$transaction(async (tx) => {
      // 1. Update Allocation
      const allocation = await tx.assetAllocation.update({
        where: { id: parseInt(id) },
        data: {
          actualReturnDate: new Date(),
          returnCondition: returnData.returnCondition,
          checkInNotes: returnData.checkInNotes,
          status: 'RETURNED',
        },
      });

      // 2. Revert Asset status back to AVAILABLE and update condition
      await tx.asset.update({
        where: { id: allocation.assetId },
        data: {
          status: 'AVAILABLE',
          condition: returnData.returnCondition,
        },
      });

      // 3. Log History
      await tx.allocationHistory.create({
        data: {
          assetAllocationId: allocation.id,
          action: 'RETURN',
          details: `Returned in condition: ${returnData.returnCondition}. Notes: ${returnData.checkInNotes || 'None'}`,
        },
      });

      return allocation;
    });
  }

  // --- Custody Transfer Requests ---
  async createTransferRequest(data) {
    return prisma.transferRequest.create({
      data: {
        allocationId: parseInt(data.allocationId),
        requestedById: parseInt(data.requestedById),
        targetEmployeeId: data.targetEmployeeId ? parseInt(data.targetEmployeeId) : null,
        targetDepartmentId: data.targetDepartmentId ? parseInt(data.targetDepartmentId) : null,
        reason: data.reason,
        status: 'PENDING',
      },
    });
  }

  async findTransferRequestById(id) {
    return prisma.transferRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        allocation: {
          include: {
            asset: true,
          },
        },
        requestedByUser: true,
      },
    });
  }

  async findAllTransferRequests() {
    return prisma.transferRequest.findMany({
      include: {
        allocation: {
          include: {
            asset: true,
            employee: true,
            department: true,
          },
        },
        requestedByUser: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async approveTransfer(id, approvedById) {
    return prisma.$transaction(async (tx) => {
      const transfer = await tx.transferRequest.findUnique({
        where: { id: parseInt(id) },
        include: { allocation: true },
      });

      if (!transfer || transfer.status !== 'PENDING') {
        throw new Error('Transfer request not found or already processed');
      }

      // 1. Terminate current allocation
      await tx.assetAllocation.update({
        where: { id: transfer.allocationId },
        data: {
          actualReturnDate: new Date(),
          status: 'TRANSFERRED',
        },
      });

      // 2. Create new allocation for target
      const newAllocation = await tx.assetAllocation.create({
        data: {
          assetId: transfer.allocation.assetId,
          employeeId: transfer.targetEmployeeId,
          departmentId: transfer.targetDepartmentId,
          status: 'ACTIVE',
        },
      });

      // 3. Mark transfer as approved
      const updatedTransfer = await tx.transferRequest.update({
        where: { id: parseInt(id) },
        data: {
          status: 'APPROVED',
          approvedById: parseInt(approvedById),
          actionedAt: new Date(),
        },
      });

      // 4. Log history for the old allocation
      await tx.allocationHistory.create({
        data: {
          assetAllocationId: transfer.allocationId,
          action: 'TRANSFER',
          details: `Custody transferred. Request ID: ${transfer.id}`,
        },
      });

      // 5. Log history for the new allocation
      await tx.allocationHistory.create({
        data: {
          assetAllocationId: newAllocation.id,
          action: 'CREATE',
          details: `Allocated via custody transfer from allocation ID: ${transfer.allocationId}`,
        },
      });

      return updatedTransfer;
    });
  }

  async rejectTransfer(id, approvedById) {
    return prisma.transferRequest.update({
      where: { id: parseInt(id) },
      data: {
        status: 'REJECTED',
        approvedById: parseInt(approvedById),
        actionedAt: new Date(),
      },
    });
  }
}

module.exports = new AllocationRepository();
