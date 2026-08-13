const userService = require('../services/userService');
const { sendSuccess } = require('../utils/response');

async function list(req, res, next) {
  try {
    const result = await userService.listUsers(req.query);
    return sendSuccess(res, 200, result);
  } catch (err) {
    return next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, 200, { user });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const user = await userService.updateProfile(req.params.id, req.user, req.body);
    return sendSuccess(res, 200, { user });
  } catch (err) {
    return next(err);
  }
}

async function changeRole(req, res, next) {
  try {
    const user = await userService.changeRole(req.params.id, req.body.role);
    return sendSuccess(res, 200, { user });
  } catch (err) {
    return next(err);
  }
}

async function changeStatus(req, res, next) {
  try {
    const user = await userService.changeStatus(req.params.id, req.body.status, req.user);
    return sendSuccess(res, 200, { user });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getOne, update, changeRole, changeStatus };
