const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

router.post('/login', controller.login);
router.get('/me', verifyToken, controller.getMe);

module.exports = router;
