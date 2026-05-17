const express = require('express');
const router = express.Router();
const controller = require('../controllers/activityController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, controller.listActivities);

module.exports = router;
