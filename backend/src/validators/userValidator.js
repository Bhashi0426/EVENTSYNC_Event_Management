const { body } = require('express-validator');

const updateProfileRules = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters.'),
  body('avatar').optional().isString(),
  body('currentPassword').optional().isString(),
  body('newPassword')
    .optional()
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
];

// Admin can only assign participant <-> organizer (never admin).
const changeRoleRules = [
  body('role')
    .notEmpty().withMessage('Role is required.')
    .isIn(['participant', 'organizer']).withMessage('Role must be participant or organizer.'),
];

const changeStatusRules = [
  body('status')
    .notEmpty().withMessage('Status is required.')
    .isIn(['active', 'disabled']).withMessage('Status must be active or disabled.'),
];

module.exports = { updateProfileRules, changeRoleRules, changeStatusRules };
