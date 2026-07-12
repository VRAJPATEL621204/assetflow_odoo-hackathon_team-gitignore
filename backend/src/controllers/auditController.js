const { z } = require('zod');
const auditService = require('../services/auditService');

const createCycleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  // Accept plain date (YYYY-MM-DD) or full ISO datetime string
  startDate: z.string().refine((v) => !isNaN(Date.parse(v)), { message: 'Invalid start date' }),
  endDate: z.string().refine((v) => !isNaN(Date.parse(v)), { message: 'Invalid end date' }),
  auditorIds: z.array(z.coerce.number().int()).optional(),
});

const verifyAssetSchema = z.object({
  // Coerce from string to int so parseInt(id) on the frontend is not required
  auditCycleId: z.coerce.number().int().positive('Audit cycle must be selected'),
  assetId: z.coerce.number().int().positive(),
  status: z.enum(['VERIFIED', 'MISSING', 'DAMAGED']),
  notes: z.string().max(250).optional().nullable(),
});

class AuditController {
  getCycles = async (req, res, next) => {
    try {
      const cycles = await auditService.getCycles();
      return res.status(200).json({ success: true, data: cycles });
    } catch (error) {
      next(error);
    }
  };

  createCycle = async (req, res, next) => {
    try {
      const validatedData = createCycleSchema.parse(req.body);
      const cycle = await auditService.createCycle(req.user.id, validatedData);
      return res.status(201).json({ success: true, data: cycle });
    } catch (error) {
      next(error);
    }
  };

  verifyAsset = async (req, res, next) => {
    try {
      const validatedData = verifyAssetSchema.parse(req.body);
      const verification = await auditService.verifyAsset(req.user.id, validatedData);
      return res.status(200).json({ success: true, data: verification });
    } catch (error) {
      next(error);
    }
  };

  closeCycle = async (req, res, next) => {
    try {
      const closed = await auditService.closeCycle(req.user.id, req.params.id);
      return res.status(200).json({ success: true, message: 'Audit cycle closed and records locked', data: closed });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AuditController();
