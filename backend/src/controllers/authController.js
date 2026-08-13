const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');
const env = require('../config/env');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.register({ name, email, password });
    res.cookie('token', token, cookieOptions);
    return sendSuccess(res, 201, { user, token });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });
    res.cookie('token', token, cookieOptions);
    return sendSuccess(res, 200, { user, token });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    return sendSuccess(res, 200, { user: req.user });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    res.clearCookie('token', { ...cookieOptions, maxAge: undefined });
    return sendSuccess(res, 200, { message: 'Logged out.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, me, logout };
