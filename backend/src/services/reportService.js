const reportRepository = require('../repositories/reportRepository');
const prisma = require('../config/prisma');

class ReportService {
  async getDashboardSummary() {
    const kpis = await reportRepository.getDashboardKPIs();
    const activities = await reportRepository.getRecentActivities();
    return { kpis, activities };
  }

  async getCategoryUtilization() {
    return reportRepository.getCategoryUtilizationReport();
  }

  async getDeptUtilization() {
    return reportRepository.getDeptUtilizationReport();
  }

  async getMaintenanceFrequency() {
    return reportRepository.getMaintenanceFrequencyReport();
  }

  async getUserNotifications(userId, isAdmin = false) {
    const notifications = await prisma.systemNotification.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    });

    if (!isAdmin) {
      return notifications.filter(n => n.userId === parseInt(userId));
    }

    // Group matching messages sent on the same day for admins
    const grouped = [];
    const seen = new Map();

    for (const n of notifications) {
      const dateStr = new Date(n.createdAt).toDateString();
      const key = `${n.type}-${n.message}-${dateStr}`;

      if (seen.has(key)) {
        const existing = seen.get(key);
        existing.userCount += 1;
        if (n.user?.name) {
          existing.recipients.push(n.user.name);
        }
        // If this belongs to the admin, keep their specific read status
        if (n.userId === parseInt(userId)) {
          existing.isRead = n.isRead;
        }
      } else {
        const copy = {
          ...n,
          userCount: 1,
          recipients: n.user?.name ? [n.user.name] : [],
        };
        seen.set(key, copy);
        grouped.push(copy);
      }
    }

    return grouped;
  }

  async markNotificationsRead(userId, isAdmin = false) {
    return prisma.systemNotification.updateMany({
      where: isAdmin
        ? { isRead: false }
        : { userId: parseInt(userId), isRead: false },
      data: { isRead: true },
    });
  }

  async markOneRead(userId, notificationId, isAdmin = false) {
    if (isAdmin) {
      const target = await prisma.systemNotification.findUnique({
        where: { id: parseInt(notificationId) },
      });
      if (target) {
        const startOfDay = new Date(target.createdAt); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(target.createdAt); endOfDay.setHours(23, 59, 59, 999);
        return prisma.systemNotification.updateMany({
          where: {
            message: target.message,
            type: target.type,
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
          data: { isRead: true },
        });
      }
    }
    return prisma.systemNotification.updateMany({
      where: { id: parseInt(notificationId), userId: parseInt(userId) },
      data: { isRead: true },
    });
  }

  /**
   * Create a custom alert notification.
   * If targetUserId is provided → single user. Otherwise → broadcast to ALL users.
   */
  async createAlert({ message, type = 'GENERAL', targetUserId, senderUserId }) {
    if (targetUserId) {
      return prisma.systemNotification.create({
        data: { userId: parseInt(targetUserId), type, message },
      });
    }
    // Broadcast: send to every user including the sender so it's visible in testing
    const users = await prisma.user.findMany({ select: { id: true } });
    const records = users.map(u => ({ userId: u.id, type, message }));
    return prisma.systemNotification.createMany({ data: records });
  }

  /**
   * Auto-generate contextual notifications from live data:
   * - Overdue allocations
   * - Pending maintenance requests
   * - Upcoming bookings today
   */
  async seedContextualNotifications() {
    const now = new Date();
    let createdCount = 0;

    // 1. Overdue allocations
    const overdueAllocations = await prisma.assetAllocation.findMany({
      where: { status: 'ACTIVE', expectedReturnDate: { lt: now } },
      include: {
        asset: { select: { tag: true, name: true } },
        employee: { select: { id: true, name: true } },
      },
    });
    for (const alloc of overdueAllocations) {
      const days = Math.floor((now - alloc.expectedReturnDate) / (1000 * 60 * 60 * 24));
      if (alloc.employee) {
        const message = `⚠️ Asset ${alloc.asset.tag} – ${alloc.asset.name} return is overdue by ${days} day(s). Please return immediately.`;
        const exists = await prisma.systemNotification.findFirst({
          where: { userId: alloc.employee.id, type: 'OVERDUE', message, isRead: false },
        });
        if (!exists) {
          await prisma.systemNotification.create({
            data: { userId: alloc.employee.id, type: 'OVERDUE', message },
          });
          createdCount++;
        }
      }
    }

    // 2. Pending maintenance requests — notify the asset manager
    const assetManagerRole = await prisma.role.findFirst({ where: { name: 'ASSET_MANAGER' } });
    let managerId = null;
    if (assetManagerRole) {
      const ur = await prisma.userRole.findFirst({ where: { roleId: assetManagerRole.id } });
      managerId = ur?.userId;
    }
    let pendingMaintenance = [];
    if (managerId) {
      pendingMaintenance = await prisma.maintenanceRequest.findMany({
        where: { status: 'PENDING' },
        include: { asset: { select: { tag: true, name: true } }, raisedByUser: { select: { name: true } } },
      });
      for (const req of pendingMaintenance) {
        const message = `🔧 Maintenance request by ${req.raisedByUser.name} for ${req.asset.tag} (${req.asset.name}) is awaiting approval.`;
        const exists = await prisma.systemNotification.findFirst({
          where: { userId: managerId, type: 'REQUEST_PENDING', message, isRead: false },
        });
        if (!exists) {
          await prisma.systemNotification.create({
            data: { userId: managerId, type: 'REQUEST_PENDING', message },
          });
          createdCount++;
        }
      }
    }

    // 3. Upcoming bookings today — notify the booker
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay   = new Date(now); endOfDay.setHours(23, 59, 59, 999);
    const todayBookings = await prisma.resourceBooking.findMany({
      where: { status: 'UPCOMING', startTime: { gte: startOfDay, lte: endOfDay } },
      include: { resource: { select: { name: true } }, bookedBy: { select: { id: true } } },
    });
    for (const booking of todayBookings) {
      const timeStr = booking.startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const message = `📅 Your booking for "${booking.resource.name}" starts today at ${timeStr}.`;
      const exists = await prisma.systemNotification.findFirst({
        where: { userId: booking.bookedBy.id, type: 'BOOKING_START', message, isRead: false },
      });
      if (!exists) {
        await prisma.systemNotification.create({
          data: { userId: booking.bookedBy.id, type: 'BOOKING_START', message },
        });
        createdCount++;
      }
    }

    return {
      overdue: overdueAllocations.length,
      pendingMaintenance: pendingMaintenance.length,
      todayBookings: todayBookings.length,
      createdCount,
    };
  }
}

module.exports = new ReportService();
