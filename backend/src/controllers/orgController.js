const prisma = require('../lib/prisma');
const { serializeUser } = require('../utils/userSerializer');

const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' }
    });
    res.status(200).send(roles);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getDirektorats = async (req, res) => {
  try {
    const data = await prisma.direktorat.findMany({
      include: {
        divisis: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const isAdminDirektorat = req.userRole === 'Admin Direktorat';
    const isPegawai = req.userRole === 'Pegawai';
    const userWhere = {};
    const attendanceUserWhere = {};

    if (isAdminDirektorat) {
      userWhere.direktoratId = req.userDirektoratId;
      attendanceUserWhere.direktoratId = req.userDirektoratId;
    }

    if (isPegawai) {
      userWhere.id = req.userId;
      attendanceUserWhere.id = req.userId;
    }

    const totalUsers = await prisma.user.count({ where: userWhere });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const attendanceWhere = {
      timeIn: { gte: startOfDay, lte: endOfDay }
    };

    if (isAdminDirektorat || isPegawai) {
      attendanceWhere.user = attendanceUserWhere;
    }

    const totalPresent = await prisma.attendance.count({ where: attendanceWhere });
    const recentAttendances = await prisma.attendance.findMany({
      where: attendanceWhere,
      include: {
        user: {
          include: {
            divisi: true,
            direktorat: true
          }
        }
      },
      orderBy: { timeIn: 'desc' },
      take: 5
    });

    const attendanceTrendDays = 7;
    const trend = [];

    for (let index = attendanceTrendDays - 1; index >= 0; index -= 1) {
      const from = new Date();
      from.setHours(0, 0, 0, 0);
      from.setDate(from.getDate() - index);
      const to = new Date(from);
      to.setHours(23, 59, 59, 999);

      const dayWhere = {
        timeIn: { gte: from, lte: to }
      };

      if (isAdminDirektorat || isPegawai) {
        dayWhere.user = attendanceUserWhere;
      }

      const count = await prisma.attendance.count({ where: dayWhere });
      trend.push({
        date: from.toISOString().slice(0, 10),
        count
      });
    }

    const usersByDivisi = await prisma.user.groupBy({
      by: ['divisiId'],
      where: userWhere,
      _count: { _all: true }
    });

    const divisiIds = usersByDivisi.map((item) => item.divisiId);
    const divisis = divisiIds.length
      ? await prisma.divisi.findMany({
          where: { id: { in: divisiIds } },
          include: { direktorat: true }
        })
      : [];

    const divisionSummary = usersByDivisi.map((item) => {
      const divisi = divisis.find((entry) => entry.id === item.divisiId);
      return {
        divisiId: item.divisiId,
        divisiName: divisi?.name || 'Divisi tidak diketahui',
        direktoratName: divisi?.direktorat?.name || '-',
        totalUsers: item._count._all
      };
    });

    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        direktorat: true,
        divisi: true,
        role: true
      }
    });

    res.status(200).send({
      totalUsers,
      totalPresent,
      totalAbsent: Math.max(totalUsers - totalPresent, 0),
      attendanceTrend: trend,
      divisionSummary,
      recentAttendances: recentAttendances.map((item) => ({
        ...item,
        user: serializeUser(item.user)
      })),
      scope: {
        role: currentUser.role.name,
        direktorat: currentUser.direktorat,
        divisi: currentUser.divisi
      }
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  getRoles,
  getDirektorats,
  getDashboardStats
};
