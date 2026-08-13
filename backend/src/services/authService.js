const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { signToken } = require('../utils/jwt');

/**
 * Register a new user. Role is ALWAYS forced to 'participant' regardless of
 * any client input — the client is never trusted to assign roles.
 */
async function register({ name, email, password }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists.');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'participant', // forced
  });

  const token = signToken(user);
  return { user, token };
}

async function login({ email, password }) {
  // password has select:false, so explicitly request it.
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }
  if (user.status === 'disabled') {
    throw ApiError.forbidden('Your account has been disabled.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const token = signToken(user);
  user.password = undefined;
  return { user, token };
}

module.exports = { register, login };
