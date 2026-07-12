const { z } = require('zod');
const allocationService = require('../services/allocationService');

const allocateAssetSchema = z.object({
  assetId: z.number().int(),
  employeeId: z.number().int().optional().nullable(),
  departmentId: z.number().int().optional().nullable(),
  expectedReturnDate: z.string().optional().nullable(),
}).refine(data => data.employeeId || data.departmentId, {
  message: 'Must allocate to either an employee or a department',
  path: ['employeeId'],
});

const returnAssetSchema = z.object({
  returnCondition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR']),
  checkInNotes: z.string().max(500).optional().nullable(),
});

const createTransferSchema = z.object({
  assetId: z.number().int(),
  targetEmployeeId: z.number().int().optional().nullable(),
  targetDepartmentId: z.number().int().optional().nullable(),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
}).refine(data => data.targetEmployeeId || data.targetDepartmentId, {
  message: 'Must specify either a target employee or department',
  path: ['targetEmployeeId'],
});

class AllocationController {
  // --- Allocations ---
  getAllocations = async (req, res, next) => {
    try {
      const allocations = await allocationService.getAllocations();
      return res.status(200).json({ success: true, data: allocations });
    } catch (error) {
      next(error);
    }
  };

  allocateAsset = async (req, res, next) => {
    try {
      const validatedData = allocateAssetSchema.parse(req.body);
      const allocation = await allocationService.allocateAsset(req.user.id, validatedData);
      return res.status(201).json({ success: true, data: allocation });
    } catch (error) {
      next(error);
    }
  };

  returnAsset = async (req, res, next) => {
    try {
      const validatedData = returnAssetSchema.parse(req.body);
      const returned = await allocationService.returnAsset(req.user.id, req.params.id, validatedData);
      return res.status(200).json({ success: true, data: returned });
    } catch (error) {
      next(error);
    }
  };

  // --- Transfers ---
  getTransferRequests = async (req, res, next) => {
    try {
      const transfers = await allocationService.getTransferRequests();
      return res.status(200).json({ success: true, data: transfers });
    } catch (error) {
      next(error);
    }
  };

  createTransferRequest = async (req, res, next) => {
    try {
      const validatedData = createTransferSchema.parse(req.body);
      const transfer = await allocationService.createTransferRequest(req.user.id, validatedData);
      return res.status(201).json({ success: true, data: transfer });
    } catch (error) {
      next(error);
    }
  };

  approveTransfer = async (req, res, next) => {
    try {
      const approved = await allocationService.approveTransfer(req.user.id, req.params.id);
      return res.status(200).json({ success: true, message: 'Transfer request approved', data: approved });
    } catch (error) {
      next(error);
    }
  };

  rejectTransfer = async (req, res, next) => {
    try {
      const rejected = await allocationService.rejectTransfer(req.user.id, req.params.id);
      return res.status(200).json({ success: true, message: 'Transfer request rejected', data: rejected });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AllocationController();
