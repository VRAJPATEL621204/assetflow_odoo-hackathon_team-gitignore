const allocationRepository = require('../repositories/allocationRepository');
const assetRepository = require('../repositories/assetRepository');
const prisma = require('../config/prisma');
const { logActivity, createNotification } = require('../utils/activity');

class AllocationService {
  async getAllocations() {
    return allocationRepository.findAllAllocations();
  }

  async getAllocationById(id) {
    const allocation = await allocationRepository.findAllocationById(id);
    if (!allocation) {
      throw new Error('Allocation records not found');
    }
    return allocation;
  }

  async allocateAsset(userId, data) {
    // 1. Check if asset exists
    const asset = await assetRepository.findById(data.assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    // 2. Conflict Check: Enforce Double-Allocation Prevention Rule
    if (asset.status !== 'AVAILABLE') {
      const activeAlloc = await allocationRepository.findActiveAllocationByAssetId(data.assetId);
      let holder = 'an active assignment';
      if (activeAlloc) {
        if (activeAlloc.employee) {
          holder = `employee ${activeAlloc.employee.name} (${activeAlloc.employee.email})`;
        } else if (activeAlloc.department) {
          holder = `department ${activeAlloc.department.name}`;
        }
      }
      throw new Error(`Asset ${asset.tag} cannot be allocated. It is currently held by ${holder}.`);
    }

    // 3. Create Allocation
    const allocation = await allocationRepository.createAllocation(data);

    // 4. Log Activity & Notify Target User
    await logActivity(
      userId,
      'ASSET_ALLOCATE',
      'asset_allocation',
      allocation.id,
      `Allocated asset ${asset.tag} ("${asset.name}")`
    );

    if (data.employeeId) {
      await createNotification(
        parseInt(data.employeeId),
        'GENERAL',
        `Asset ${asset.tag} ("${asset.name}") has been allocated to you.`
      );
    }

    return allocation;
  }

  async returnAsset(userId, id, returnData) {
    const allocation = await allocationRepository.findAllocationById(id);
    if (!allocation || allocation.status !== 'ACTIVE') {
      throw new Error('Active allocation record not found');
    }

    // Process return
    const updated = await allocationRepository.returnAllocation(id, returnData);

    // Log Activity & Notify User
    await logActivity(
      userId,
      'ASSET_RETURN',
      'asset_allocation',
      updated.id,
      `Returned asset ID ${updated.assetId} with condition ${returnData.returnCondition}`
    );

    if (allocation.employeeId) {
      await createNotification(
        allocation.employeeId,
        'GENERAL',
        `Asset check-in complete. Asset ${allocation.asset.tag} returned successfully.`
      );
    }

    return updated;
  }

  // --- Custody Transfer Requests ---
  async getTransferRequests() {
    return allocationRepository.findAllTransferRequests();
  }

  async createTransferRequest(userId, data) {
    // Find active allocation for the asset
    const activeAlloc = await allocationRepository.findActiveAllocationByAssetId(data.assetId);
    if (!activeAlloc) {
      throw new Error('This asset has no active allocation. You can allocate it directly.');
    }

    // Prevent requesting transfer to the current holder
    if (data.targetEmployeeId && activeAlloc.employeeId === parseInt(data.targetEmployeeId)) {
      throw new Error('Target employee already holds custody of this asset');
    }
    if (data.targetDepartmentId && activeAlloc.departmentId === parseInt(data.targetDepartmentId)) {
      throw new Error('Target department already holds custody of this asset');
    }

    const transfer = await allocationRepository.createTransferRequest({
      allocationId: activeAlloc.id,
      requestedById: userId,
      targetEmployeeId: data.targetEmployeeId,
      targetDepartmentId: data.targetDepartmentId,
      reason: data.reason,
    });

    // Notify current holder that a transfer is requested
    if (activeAlloc.employeeId) {
      await createNotification(
        activeAlloc.employeeId,
        'REQUEST_PENDING',
        `A custody transfer request has been raised for your allocated asset ${activeAlloc.asset?.tag || ''}.`
      );
    }

    return transfer;
  }

  async approveTransfer(userId, id) {
    const transfer = await allocationRepository.findTransferRequestById(id);
    if (!transfer) {
      throw new Error('Transfer request not found');
    }

    const updated = await allocationRepository.approveTransfer(id, userId);

    // Logs and Notifications
    await logActivity(
      userId,
      'TRANSFER_APPROVE',
      'transfer_request',
      updated.id,
      `Approved custody transfer for asset ID ${transfer.allocation.assetId}`
    );

    // Notify requester
    await createNotification(
      transfer.requestedById,
      'GENERAL',
      `Your custody transfer request for asset ${transfer.allocation.asset.tag} has been approved.`
    );

    // Notify new target employee
    if (transfer.targetEmployeeId) {
      await createNotification(
        transfer.targetEmployeeId,
        'GENERAL',
        `Custody of asset ${transfer.allocation.asset.tag} has been transferred to you.`
      );
    }

    return updated;
  }

  async rejectTransfer(userId, id) {
    const transfer = await allocationRepository.findTransferRequestById(id);
    if (!transfer) {
      throw new Error('Transfer request not found');
    }

    const updated = await allocationRepository.rejectTransfer(id, userId);

    // Logs & Notifications
    await logActivity(
      userId,
      'TRANSFER_REJECT',
      'transfer_request',
      updated.id,
      `Rejected custody transfer for asset ID ${transfer.allocation.assetId}`
    );

    await createNotification(
      transfer.requestedById,
      'GENERAL',
      `Your custody transfer request for asset ${transfer.allocation.asset.tag} was rejected.`
    );

    return updated;
  }
}

module.exports = new AllocationService();
