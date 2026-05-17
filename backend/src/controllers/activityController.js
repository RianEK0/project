const prisma = require('../lib/prisma');
const { serializeUser } = require('../utils/userSerializer');

const listActivities = async (req, res) => {
  try {
    const where = {};

    if (req.userRole === 'Admin Direktorat') {
      where.user = { direktoratId: req.userDirektoratId };
    }

    if (req.userRole === 'Pegawai') {
      where.userId = req.userId;
    }

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          include: {
            direktorat: true,
            divisi: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.status(200).send(
      logs.map((item) => ({
        ...item,
        user: serializeUser(item.user)
      }))
    );
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  listActivities
};
