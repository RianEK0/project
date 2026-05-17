const express = require('express');
const router = express.Router();
const controller = require('../controllers/locationController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, controller.getLocations);
router.post('/update', verifyToken, controller.updateLocation);

module.exports = router;
