const fs = require('fs');
const path = require('path');
const prisma = require('../lib/prisma');
const { createActivityLog } = require('../utils/activity');
const { createNotification } = require('../utils/notifications');
const { serializeUser } = require('../utils/userSerializer');

const saveBase64Image = (base64String) => {
  if (!base64String) return null;
  const matches = base64String.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return null;
  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `${Date.now()}-attendance.jpg`;
  fs.writeFileSync(path.join(__dirname, '../../uploads', filename), buffer);
  return `/uploads/${filename}`;
};

const buildScopedWhere = (req) => {
  const where = {};

  if (req.userRole === 'Admin Direktorat') {
    where.user = { direktoratId: req.userDirektoratId };
  }

  if (req.userRole === 'Pegawai') {
    where.userId = req.userId;
  }

  return where;
};

const applyAttendanceFilters = (req, where) => {
  const { startDate, endDate, direktoratId, divisiId, userId, status } = req.query;

  if (startDate || endDate) {
    where.timeIn = {};

    if (startDate) {
      where.timeIn.gte = new Date(`${startDate}T00:00:00.000Z`);
    }

    if (endDate) {
      where.timeIn.lte = new Date(`${endDate}T23:59:59.999Z`);
    }
  }

  if (!where.user && (direktoratId || divisiId)) {
    where.user = {};
  }

  if (direktoratId && req.userRole === 'Super Admin') {
    where.user = {
      ...(where.user || {}),
      direktoratId: parseInt(direktoratId, 10)
    };
  }

  if (divisiId) {
    where.user = {
      ...(where.user || {}),
      divisiId: parseInt(divisiId, 10)
    };
  }

  if (userId && req.userRole !== 'Pegawai') {
    where.userId = parseInt(userId, 10);
  }

  if (status) {
    where.status = status;
  }
};

const getStartAndEndOfDay = () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

const checkIn = async (req, res) => {
  try {
    const { photoIn, isValid, lat, lng, note } = req.body;

    if (!photoIn) {
      return res.status(400).send({ message: 'Wajah wajib dipindai untuk absen masuk.' });
    }

    const { startOfDay, endOfDay } = getStartAndEndOfDay();

    const existing = await prisma.attendance.findFirst({
      where: {
        userId: req.userId,
        timeIn: { gte: startOfDay, lte: endOfDay }
      }
    });

    if (existing) {
      return res.status(400).send({ message: 'Anda sudah melakukan absen masuk hari ini.' });
    }

    const photoPath = saveBase64Image(photoIn);
    const currentHour = new Date().getHours();
    const status = currentHour > 9 ? 'Terlambat' : 'Hadir';
    const attendanceIsValid = typeof isValid === 'boolean' ? isValid : true;

    const attendance = await prisma.attendance.create({
      data: {
        userId: req.userId,
        photoIn: photoPath,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        status: attendanceIsValid ? status : 'Tidak Valid',
        isValid: attendanceIsValid,
        note: note || null
      },
      include: {
        user: {
          include: {
            direktorat: true,
            divisi: true
          }
        }
      }
    });

    await createActivityLog({
      userId: req.userId,
      action: 'CHECK_IN',
      description: `Absen masuk dengan status ${attendance.status}`,
      entityType: 'Attendance',
      entityId: attendance.id
    });

    if (!attendanceIsValid) {
      await createNotification({
        title: 'Absensi tidak valid',
        message: `Terdeteksi absensi tidak valid dari ${attendance.user.name}.`,
        type: 'warning',
        roleScope: 'Admin Direktorat',
        meta: { attendanceId: attendance.id }
      });
    }

    res.status(201).send({
      ...attendance,
      user: serializeUser(attendance.user)
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const checkOut = async (req, res) => {
  try {
    const { photoOut, lat, lng, note } = req.body;

    if (!photoOut) {
      return res.status(400).send({ message: 'Wajah wajib dipindai untuk absen pulang.' });
    }

    const { startOfDay, endOfDay } = getStartAndEndOfDay();

    const existing = await prisma.attendance.findFirst({
      where: {
        userId: req.userId,
        timeIn: { gte: startOfDay, lte: endOfDay }
      }
    });

    if (!existing) {
      return res.status(400).send({ message: 'Absen masuk hari ini belum ditemukan.' });
    }

    if (existing.timeOut) {
      return res.status(400).send({ message: 'Anda sudah melakukan absen pulang hari ini.' });
    }

    const photoPath = saveBase64Image(photoOut);

    const attendance = await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        timeOut: new Date(),
        photoOut: photoPath,
        lat: lat ? parseFloat(lat) : existing.lat,
        lng: lng ? parseFloat(lng) : existing.lng,
        note: note || existing.note
      },
      include: {
        user: {
          include: {
            direktorat: true,
            divisi: true
          }
        }
      }
    });

    await createActivityLog({
      userId: req.userId,
      action: 'CHECK_OUT',
      description: 'Absen pulang berhasil dilakukan',
      entityType: 'Attendance',
      entityId: attendance.id
    });

    res.status(200).send({
      ...attendance,
      user: serializeUser(attendance.user)
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getAttendances = async (req, res) => {
  try {
    const where = buildScopedWhere(req);
    applyAttendanceFilters(req, where);

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          include: {
            direktorat: true,
            divisi: true,
            role: true
          }
        }
      },
      orderBy: { timeIn: 'desc' }
    });

    res.status(200).send(
      attendances.map((item) => ({
        ...item,
        user: serializeUser(item.user)
      }))
    );
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const exportAttendances = async (req, res) => {
  try {
    const where = buildScopedWhere(req);
    applyAttendanceFilters(req, where);

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          include: {
            direktorat: true,
            divisi: true
          }
        }
      },
      orderBy: { timeIn: 'desc' }
    });

    const rows = [
      ['Tanggal', 'Nama', 'Email', 'Direktorat', 'Divisi', 'Masuk', 'Pulang', 'Status', 'Validasi']
    ];

    attendances.forEach((item) => {
      rows.push([
        new Date(item.timeIn).toLocaleDateString('id-ID'),
        item.user.name,
        item.user.email,
        item.user.direktorat.name,
        item.user.divisi.name,
        new Date(item.timeIn).toLocaleTimeString('id-ID'),
        item.timeOut ? new Date(item.timeOut).toLocaleTimeString('id-ID') : '-',
        item.status,
        item.isValid ? 'Valid' : 'Tidak Valid'
      ]);
    });

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance-export.csv"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getAttendanceSummary = async (req, res) => {
  try {
    const where = buildScopedWhere(req);
    applyAttendanceFilters(req, where);

    const [total, valid, invalid] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.count({ where: { ...where, isValid: true } }),
      prisma.attendance.count({ where: { ...where, isValid: false } })
    ]);

    res.status(200).send({
      total,
      valid,
      invalid
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getTodayReminder = async (req, res) => {
  try {
    const { startOfDay, endOfDay } = getStartAndEndOfDay();

    const attendanceToday = await prisma.attendance.findFirst({
      where: {
        userId: req.userId,
        timeIn: { gte: startOfDay, lte: endOfDay }
      }
    });

    res.status(200).send({
      shouldRemind: !attendanceToday,
      message: attendanceToday
        ? 'Absensi hari ini sudah tercatat.'
        : 'Anda belum melakukan absensi hari ini.'
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendances,
  exportAttendances,
  getAttendanceSummary,
  getTodayReminder
};
