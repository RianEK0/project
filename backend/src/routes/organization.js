const express = require('express');
const router = express.Router();
const controller = require('../controllers/orgController');
const { verifyToken } = require('../middlewares/auth');

router.get('/roles', controller.getRoles);
router.get('/direktorats', controller.getDirektorats);
router.get('/stats', verifyToken, controller.getDashboardStats);

module.exports = router;
