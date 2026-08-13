const express = require('express');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  updateProfileRules,
  changeRoleRules,
  changeStatusRules,
} = require('../validators/userValidator');

const router = express.Router();

router.use(requireAuth);

// Admin: list all users
router.get('/', requireRole('admin'), userController.list);

// Any authenticated user: view a profile
router.get('/:id', userController.getOne);

// Self (or admin): update profile
router.put('/:id', updateProfileRules, validate, userController.update);

// Admin: change role (participant <-> organizer only)
router.patch('/:id/role', requireRole('admin'), changeRoleRules, validate, userController.changeRole);

// Admin: enable/disable account
router.patch('/:id/status', requireRole('admin'), changeStatusRules, validate, userController.changeStatus);

module.exports = router;
