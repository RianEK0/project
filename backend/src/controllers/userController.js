const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { serializeUser } = require('../utils/userSerializer');
const { createActivityLog } = require('../utils/activity');
const { createNotification } = require('../utils/notifications');

const USER_INCLUDE = {
  role: true,
  direktorat: true,
  divisi: true
};

const canManageTargetUser = async (actor, targetUserId) => {
  if (actor.role === 'Super Admin') return true;
  if (actor.role === 'Pegawai') return actor.id === targetUserId;

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId }
  });

  return Boolean(targetUser && targetUser.direktoratId === actor.direktoratId);
};

const getActorContext = async (req) => {
  const actor = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { role: true }
  });

  return {
    id: actor.id,
    role: actor.role.name,
    direktoratId: actor.direktoratId
  };
};

const normalizeUserPayload = (body, actor) => {
  const data = {
    name: body.name?.trim(),
    email: body.email?.trim().toLowerCase(),
    position: body.position?.trim(),
    roleId: body.roleId ? parseInt(body.roleId, 10) : undefined,
    direktoratId: body.direktoratId ? parseInt(body.direktoratId, 10) : undefined,
    divisiId: body.divisiId ? parseInt(body.divisiId, 10) : undefined
  };

  if (actor.role === 'Admin Direktorat') {
    data.direktoratId = actor.direktoratId;
  }

  return data;
};

const validateUserPayload = async (payload, { isCreate = true } = {}) => {
  if (!payload.name || !payload.email || !payload.position) {
    return 'Nama, email, dan jabatan wajib diisi.';
  }

  if (isCreate && !payload.password) {
    return 'Password wajib diisi.';
  }

  if (!payload.roleId || !payload.direktoratId || !payload.divisiId) {
    return 'Role, direktorat, dan divisi wajib dipilih.';
  }

  const [role, direktorat, divisi] = await Promise.all([
    prisma.role.findUnique({ where: { id: payload.roleId } }),
    prisma.direktorat.findUnique({ where: { id: payload.direktoratId } }),
    prisma.divisi.findUnique({ where: { id: payload.divisiId } })
  ]);

  if (!role || !direktorat || !divisi) {
    return 'Data organisasi tidak valid.';
  }

  if (divisi.direktoratId !== direktorat.id) {
    return 'Divisi tidak berada di dalam direktorat yang dipilih.';
  }

  return null;
};

const getUsers = async (req, res) => {
  try {
    const search = req.query.search?.trim();
    const direktoratId = req.query.direktoratId ? parseInt(req.query.direktoratId, 10) : null;
    const divisiId = req.query.divisiId ? parseInt(req.query.divisiId, 10) : null;
    const actor = await getActorContext(req);

    const where = {};

    if (actor.role === 'Admin Direktorat') {
      where.direktoratId = actor.direktoratId;
    } else if (actor.role === 'Pegawai') {
      where.id = actor.id;
    }

    if (direktoratId && actor.role === 'Super Admin') {
      where.direktoratId = direktoratId;
    }

    if (divisiId) {
      where.divisiId = divisiId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { position: { contains: search } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: USER_INCLUDE,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).send(users.map(serializeUser));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const actor = await getActorContext(req);
    const allowed = await canManageTargetUser(actor, id);

    if (!allowed) {
      return res.status(403).send({ message: 'Anda tidak punya akses ke data pegawai ini.' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        ...USER_INCLUDE,
        attendances: {
          orderBy: { timeIn: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return res.status(404).send({ message: 'Pegawai tidak ditemukan.' });
    }

    res.status(200).send(serializeUser(user));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const actor = await getActorContext(req);
    const payload = normalizeUserPayload(req.body, actor);
    payload.password = req.body.password;

    const validationError = await validateUserPayload(payload, { isCreate: true });
    if (validationError) {
      return res.status(400).send({ message: validationError });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email }
    });

    if (existingUser) {
      return res.status(409).send({ message: 'Email sudah digunakan.' });
    }

    const role = await prisma.role.findUnique({ where: { id: payload.roleId } });
    if (actor.role === 'Admin Direktorat' && role.name === 'Super Admin') {
      return res.status(403).send({ message: 'Admin Direktorat tidak dapat membuat Super Admin.' });
    }

    const photo = req.file ? `/uploads/${req.file.filename}` : null;
    const user = await prisma.user.create({
      data: {
        ...payload,
        password: bcrypt.hashSync(payload.password, 10),
        photo
      },
      include: USER_INCLUDE
    });

    await createActivityLog({
      userId: req.userId,
      action: 'CREATE_USER',
      description: `Membuat pegawai ${user.name}`,
      entityType: 'User',
      entityId: user.id
    });

    await createNotification({
      title: 'Pegawai baru ditambahkan',
      message: `${user.name} telah didaftarkan ke dalam sistem.`,
      type: 'success',
      roleScope: actor.role === 'Super Admin' ? 'Super Admin' : 'Admin Direktorat'
    });

    res.status(201).send(serializeUser(user));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const actor = await getActorContext(req);
    const allowed = await canManageTargetUser(actor, id);

    if (!allowed || actor.role === 'Pegawai') {
      return res.status(403).send({ message: 'Anda tidak dapat mengubah data ini.' });
    }

    const currentUser = await prisma.user.findUnique({ where: { id }, include: USER_INCLUDE });
    if (!currentUser) {
      return res.status(404).send({ message: 'Pegawai tidak ditemukan.' });
    }

    const payload = normalizeUserPayload(req.body, actor);
    const validationError = await validateUserPayload(
      {
        ...payload,
        password: req.body.password || 'existing-password'
      },
      { isCreate: false }
    );

    if (validationError) {
      return res.status(400).send({ message: validationError });
    }

    if (payload.email && payload.email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: payload.email }
      });
      if (existingUser) {
        return res.status(409).send({ message: 'Email sudah digunakan.' });
      }
    }

    const role = await prisma.role.findUnique({ where: { id: payload.roleId } });
    if (actor.role === 'Admin Direktorat' && role.name === 'Super Admin') {
      return res.status(403).send({ message: 'Admin Direktorat tidak dapat menetapkan role Super Admin.' });
    }

    const updateData = {
      ...payload
    };

    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    if (req.body.password) {
      updateData.password = bcrypt.hashSync(req.body.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: USER_INCLUDE
    });

    await createActivityLog({
      userId: req.userId,
      action: 'UPDATE_USER',
      description: `Memperbarui data pegawai ${user.name}`,
      entityType: 'User',
      entityId: user.id
    });

    res.status(200).send(serializeUser(user));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const actor = await getActorContext(req);
    const allowed = await canManageTargetUser(actor, id);

    if (!allowed || actor.id === id) {
      return res.status(403).send({ message: 'Data pegawai tidak dapat dihapus.' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).send({ message: 'Pegawai tidak ditemukan.' });
    }

    await prisma.user.delete({ where: { id } });

    await createActivityLog({
      userId: req.userId,
      action: 'DELETE_USER',
      description: `Menghapus pegawai ${user.name}`,
      entityType: 'User',
      entityId: id
    });

    res.status(200).send({ message: 'Pegawai berhasil dihapus.' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      include: USER_INCLUDE
    });

    if (!currentUser) {
      return res.status(404).send({ message: 'User tidak ditemukan.' });
    }

    const updateData = {
      name: req.body.name?.trim() || currentUser.name,
      position: req.body.position?.trim() || currentUser.position
    };

    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    if (req.body.password) {
      updateData.password = bcrypt.hashSync(req.body.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      include: USER_INCLUDE
    });

    await createActivityLog({
      userId: req.userId,
      action: 'UPDATE_PROFILE',
      description: 'Memperbarui profil sendiri',
      entityType: 'User',
      entityId: req.userId
    });

    res.status(200).send(serializeUser(user));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const enrollFace = async (req, res) => {
  try {
    const { faceDescriptor } = req.body;

    if (!Array.isArray(faceDescriptor) || faceDescriptor.length === 0) {
      return res.status(400).send({ message: 'Descriptor wajah tidak valid.' });
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        faceDescriptor: JSON.stringify(faceDescriptor),
        faceEnrolledAt: new Date()
      },
      include: USER_INCLUDE
    });

    await createActivityLog({
      userId: req.userId,
      action: 'ENROLL_FACE',
      description: 'Melakukan pendaftaran biometrik wajah',
      entityType: 'User',
      entityId: req.userId
    });

    await createNotification({
      title: 'Biometrik wajah diperbarui',
      message: `${user.name} berhasil memperbarui data pengenalan wajah.`,
      type: 'info',
      userId: req.userId
    });

    res.status(200).send(serializeUser(user));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateMyProfile,
  enrollFace
};
