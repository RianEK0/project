const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const verifyToken = (req, res, next) => {
  let token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'komdigi-secret-key', async (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' });
    }
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { role: true }
      });

      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }

      req.userId = decoded.id;
      req.userRole = user.role.name;
      req.userDirektoratId = user.direktoratId;
      next();
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
};

const verifyRole = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: { role: true }
      });
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
      if (roles.includes(user.role.name)) {
        req.userRole = user.role.name;
        req.userDirektoratId = user.direktoratId;
        next();
      } else {
        res.status(403).send({ message: 'Require Role: ' + roles.join(' or ') });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };
};

module.exports = {
  verifyToken,
  verifyRole
};
