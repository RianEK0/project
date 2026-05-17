const prisma = require('../lib/prisma');

const createNotification = async ({
  title,
  message,
  type = 'info',
  userId = null,
  roleScope = null,
  meta = null
}) => {
  try {
    await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId,
        roleScope,
        meta: meta ? JSON.stringify(meta) : null
      }
    });
  } catch (error) {
    console.error('Failed to write notification:', error.message);
  }
};

module.exports = {
  createNotification
};
