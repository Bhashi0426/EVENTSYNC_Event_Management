const mongoose = require('mongoose');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

async function listUsers(query = {}) {
  const filter = {};
  if (query.search) {
    const rx = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  if (query.role) filter.role = query.role;
  if (query.status) filter.status = query.status;

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

async function getUserById(id) {
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid user id.');
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found.');
  return user;
}

/**
 * Update own profile. Supports name/avatar and an optional password change
 * that requires the current password.
 */
async function updateProfile(targetId, requester, data) {
  const isSelf = targetId === requester._id.toString();
  if (!isSelf && requester.role !== 'admin') {
    throw ApiError.forbidden('You can only update your own profile.');
  }

  const user = await User.findById(targetId).select('+password');
  if (!user) throw ApiError.notFound('User not found.');

  if (data.name !== undefined) user.name = data.name;
  if (data.avatar !== undefined) user.avatar = data.avatar;

  if (data.newPassword) {
    // Changing password requires the current one (unless an admin acts).
    if (isSelf) {
      if (!data.currentPassword) {
        throw ApiError.badRequest('Current password is required to set a new password.');
      }
      const ok = await user.comparePassword(data.currentPassword);
      if (!ok) throw ApiError.badRequest('Current password is incorrect.');
    }
    user.password = data.newPassword; // hashed by pre-save hook
  }

  await user.save();
  user.password = undefined;
  return user;
}

/* Admin only. Can only toggle participant <-> organizer (never admin). */
async function changeRole(id, role) {
  if (!['participant', 'organizer'].includes(role)) {
    throw ApiError.badRequest('Role must be participant or organizer.');
  }
  const user = await getUserById(id);
  if (user.role === 'admin') {
    throw ApiError.forbidden('Admin roles cannot be changed here.');
  }
  user.role = role;
  await user.save();
  return user;
}

/* Admin only. Enable/disable an account. */
async function changeStatus(id, status, requester) {
  if (!['active', 'disabled'].includes(status)) {
    throw ApiError.badRequest('Status must be active or disabled.');
  }
  const user = await getUserById(id);
  if (user._id.toString() === requester._id.toString()) {
    throw ApiError.badRequest('You cannot change your own status.');
  }
  if (user.role === 'admin') {
    throw ApiError.forbidden('Admin accounts cannot be disabled here.');
  }
  user.status = status;
  await user.save();
  return user;
}

module.exports = {
  listUsers,
  getUserById,
  updateProfile,
  changeRole,
  changeStatus,
};
