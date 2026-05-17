const prisma = require('../lib/prisma');

const buildNotificationWhere = (req) => {
  if (req.userRole === 'Super Admin') {
    return {
      OR: [
        { roleScope: 'Super Admin' },
        { roleScope: null },
        { userId: req.userId }
      ]
    };
  }

  if (req.userRole === 'Admin Direktorat') {
    return {
      OR: [
        { roleScope: 'Admin Direktorat' },
        { roleScope: null },
        { userId: req.userId }
      ]
    };
  }

  return {
    OR: [{ userId: req.userId }, { roleScope: 'Pegawai' }]
  };
};

const listNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: buildNotificationWhere(req),
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.status(200).send(
      notifications.map((item) => ({
        ...item,
        meta: item.meta ? JSON.parse(item.meta) : null
      }))
    );
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.status(200).send(notification);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  listNotifications,
  markNotificationRead
};
