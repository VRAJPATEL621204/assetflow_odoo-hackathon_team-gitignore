const reportService = require('../services/reportService');

class ReportController {
  getDashboardSummary = async (req, res, next) => {
    try {
      const summary = await reportService.getDashboardSummary();
      return res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  };

  getCategoryUtilization = async (req, res, next) => {
    try {
      const report = await reportService.getCategoryUtilization();
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  };

  getNotifications = async (req, res, next) => {
    try {
      const isManagerOrAdmin = req.user.roles && (req.user.roles.includes('ADMIN') || req.user.roles.includes('ASSET_MANAGER'));
      const notifications = await reportService.getUserNotifications(req.user.id, isManagerOrAdmin);
      return res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  };

  markNotificationsRead = async (req, res, next) => {
    try {
      const isManagerOrAdmin = req.user.roles && (req.user.roles.includes('ADMIN') || req.user.roles.includes('ASSET_MANAGER'));
      await reportService.markNotificationsRead(req.user.id, isManagerOrAdmin);
      return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  };
  getDeptUtilization = async (req, res, next) => {
    try {
      const report = await reportService.getDeptUtilization();
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  };

  getMaintenanceFrequency = async (req, res, next) => {
    try {
      const report = await reportService.getMaintenanceFrequency();
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  };

  createAlert = async (req, res, next) => {
    try {
      const { message, type, targetUserId } = req.body;
      if (!message || message.trim().length < 3) {
        return res.status(400).json({ success: false, message: 'Alert message must be at least 3 characters.' });
      }
      const result = await reportService.createAlert({
        message: message.trim(),
        type: type || 'GENERAL',
        targetUserId: targetUserId || null,
        senderUserId: req.user.id,
      });
      return res.status(201).json({ success: true, data: result, message: 'Alert sent successfully.' });
    } catch (error) {
      next(error);
    }
  };

  markOneRead = async (req, res, next) => {
    try {
      const isManagerOrAdmin = req.user.roles && (req.user.roles.includes('ADMIN') || req.user.roles.includes('ASSET_MANAGER'));
      await reportService.markOneRead(req.user.id, req.params.id, isManagerOrAdmin);
      return res.status(200).json({ success: true, message: 'Notification marked as read.' });
    } catch (error) {
      next(error);
    }
  };

  seedContextualNotifications = async (req, res, next) => {
    try {
      const result = await reportService.seedContextualNotifications();
      return res.status(200).json({ success: true, data: result, message: 'Contextual notifications generated.' });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ReportController();
