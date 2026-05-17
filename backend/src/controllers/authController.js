const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { serializeUser } = require('../utils/userSerializer');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        direktorat: true,
        divisi: true
      }
    });

    if (!user) {
      return res.status(404).send({ message: 'User Not found.' });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: 'Invalid Password!'
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'komdigi-secret-key', {
      expiresIn: 86400 // 24 hours
    });

    res.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      direktorat: user.direktorat,
      divisi: user.divisi,
      photo: user.photo,
      faceEnrolledAt: user.faceEnrolledAt,
      accessToken: token
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        role: true,
        direktorat: true,
        divisi: true
      }
    });
    if (!user) return res.status(404).send({ message: 'User not found.' });
    res.status(200).send(serializeUser(user));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  login,
  getMe
};
