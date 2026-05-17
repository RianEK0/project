const prisma = require('../lib/prisma');

const createActivityLog = async ({
  userId,
  action,
  description,
  entityType,
  entityId
}) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId: userId || null,
        action,
        description,
        entityType,
        entityId: entityId || null
      }
    });
  } catch (error) {
    console.error('Failed to write activity log:', error.message);
  }
};

module.exports = {
  createActivityLog
};
