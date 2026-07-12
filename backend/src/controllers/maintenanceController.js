const { z } = require('zod');
const maintenanceService = require('../services/maintenanceService');

const createRequestSchema = z.object({
  assetId: z.number().int(),
  description: z.string().min(5, 'Description must be at least 5 characters').max(500),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

const updateRequestSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'RESOLVED']),
  technicianId: z.number().int().optional().nullable(),
  actionTaken: z.string().max(500).optional().nullable(),
  partsReplaced: z.string().max(250).optional().nullable(),
  cost: z.number().nonnegative().optional().nullable(),
});

const createTechnicianSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(100).toLowerCase().trim(),
  specialty: z.string().min(2, 'Specialty must be at least 2 characters').max(100),
});

class MaintenanceController {
  getRequests = async (req, res, next) => {
    try {
      const requests = await maintenanceService.getRequests();
      return res.status(200).json({ success: true, data: requests });
    } catch (error) {
      next(error);
    }
  };

  createRequest = async (req, res, next) => {
    try {
      const validatedData = createRequestSchema.parse(req.body);
      const request = await maintenanceService.createRequest(req.user.id, validatedData);
      return res.status(201).json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  };

  getTechnicians = async (req, res, next) => {
    try {
      const technicians = await maintenanceService.getTechnicians();
      return res.status(200).json({ success: true, data: technicians });
    } catch (error) {
      next(error);
    }
  };

  createTechnician = async (req, res, next) => {
    try {
      const validatedData = createTechnicianSchema.parse(req.body);
      const tech = await maintenanceService.createTechnician(validatedData);
      return res.status(201).json({ success: true, data: tech });
    } catch (error) {
      next(error);
    }
  };

  updateRequest = async (req, res, next) => {
    try {
      const validatedData = updateRequestSchema.parse(req.body);
      const updated = await maintenanceService.updateRequest(req.user.id, req.params.id, validatedData);
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new MaintenanceController();
