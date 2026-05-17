const express = require('express');
const router = express.Router();
const controller = require('../controllers/projectController');
const { verifyToken, verifyRole } = require('../middlewares/auth');

router.get('/', verifyToken, controller.getProjects);
router.post('/', [verifyToken, verifyRole(['Super Admin', 'Admin Direktorat'])], controller.createProject);
router.put('/:id', [verifyToken, verifyRole(['Super Admin', 'Admin Direktorat'])], controller.updateProject);
router.delete('/:id', [verifyToken, verifyRole(['Super Admin', 'Admin Direktorat'])], controller.deleteProject);

module.exports = router;
