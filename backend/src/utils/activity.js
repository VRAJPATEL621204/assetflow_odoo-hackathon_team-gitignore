const prisma = require('../config/prisma');

async function logActivity(userId, action, entityName, entityId, details) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityName,
        entityId: entityId ? parseInt(entityId) : null,
        details,
      },
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

async function createNotification(userId, type, message) {
  try {
    await prisma.systemNotification.create({
      data: {
        userId,
        type,
        message,
      },
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

module.exports = { logActivity, createNotification };
