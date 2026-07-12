const { z } = require('zod');
const organizationService = require('../services/organizationService');

// Zod Validation Schemas
const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').max(50),
  parentId: z.union([z.number(), z.string(), z.null()]).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

const customFieldSchema = z.object({
  fieldName: z.string().min(1, 'Field name is required'),
  fieldType: z.enum(['string', 'number', 'boolean']),
  isRequired: z.boolean().optional(),
});

const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(50),
  customFields: z.array(customFieldSchema).optional(),
});

const promoteEmployeeSchema = z.object({
  roleName: z.enum(['ADMIN', 'ASSET_MANAGER', 'DEPT_HEAD', 'EMPLOYEE']),
});

const createLocationSchema = z.object({
  name: z.string().min(2, 'Location name must be at least 2 characters').max(100),
  address: z.string().max(250).optional().nullable(),
});

class OrganizationController {
  // --- Departments ---
  getDepartments = async (req, res, next) => {
    try {
      const departments = await organizationService.getDepartments();
      return res.status(200).json({ success: true, data: departments });
    } catch (error) {
      next(error);
    }
  };

  createDepartment = async (req, res, next) => {
    try {
      const validatedData = createDepartmentSchema.parse(req.body);
      const newDept = await organizationService.createDepartment(validatedData);
      return res.status(201).json({ success: true, data: newDept });
    } catch (error) {
      next(error);
    }
  };

  updateDepartment = async (req, res, next) => {
    try {
      const validatedData = createDepartmentSchema.parse(req.body);
      const updatedDept = await organizationService.updateDepartment(req.params.id, validatedData);
      return res.status(200).json({ success: true, data: updatedDept });
    } catch (error) {
      next(error);
    }
  };

  // --- Asset Categories ---
  getCategories = async (req, res, next) => {
    try {
      const categories = await organizationService.getCategories();
      return res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req, res, next) => {
    try {
      const validatedData = createCategorySchema.parse(req.body);
      const newCategory = await organizationService.createCategory(validatedData);
      return res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
      next(error);
    }
  };

  // --- Employees & Promotions ---
  getEmployees = async (req, res, next) => {
    try {
      const employees = await organizationService.getEmployees();
      return res.status(200).json({ success: true, data: employees });
    } catch (error) {
      next(error);
    }
  };

  promoteEmployee = async (req, res, next) => {
    try {
      const { roleName } = promoteEmployeeSchema.parse(req.body);
      const updatedUser = await organizationService.promoteEmployee(req.params.id, { roleName });
      return res.status(200).json({ success: true, message: `Employee promoted to ${roleName}`, data: updatedUser });
    } catch (error) {
      next(error);
    }
  };

  getLocations = async (req, res, next) => {
    try {
      const locations = await organizationService.getLocations();
      return res.status(200).json({ success: true, data: locations });
    } catch (error) {
      next(error);
    }
  };

  createLocation = async (req, res, next) => {
    try {
      const validatedData = createLocationSchema.parse(req.body);
      const newLocation = await organizationService.createLocation(validatedData);
      return res.status(201).json({ success: true, data: newLocation });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new OrganizationController();
