const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const { verifyToken, verifyRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/', [verifyToken], controller.getUsers);
router.put('/me/profile', [verifyToken, upload.single('photo')], controller.updateMyProfile);
router.post('/me/enroll-face', [verifyToken], controller.enrollFace);
router.post('/', [verifyToken, verifyRole(['Super Admin', 'Admin Direktorat']), upload.single('photo')], controller.createUser);
router.put('/:id', [verifyToken, verifyRole(['Super Admin', 'Admin Direktorat']), upload.single('photo')], controller.updateUser);
router.delete('/:id', [verifyToken, verifyRole(['Super Admin', 'Admin Direktorat'])], controller.deleteUser);
router.get('/:id', [verifyToken], controller.getUserById);

module.exports = router;
