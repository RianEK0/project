const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    await prisma.user.update({
      where: { id: req.userId },
      data: { lat: parseFloat(lat), lng: parseFloat(lng), lastActive: new Date() }
    });
    res.status(200).send({ message: 'Location updated' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getLocations = async (req, res) => {
  try {
    let where = {
      lat: { not: null },
      lng: { not: null }
    };
    
    if (req.userRole === 'Admin Direktorat') {
      where.direktoratId = req.userDirektoratId;
    } else if (req.userRole === 'Pegawai') {
      where.id = req.userId;
    }

    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, lat: true, lng: true, lastActive: true, role: true, direktorat: true, divisi: true }
    });

    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { updateLocation, getLocations };
