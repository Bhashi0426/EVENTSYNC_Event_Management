const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Event = require('../src/models/Event');
const { signToken } = require('../src/utils/jwt');

async function createUser(overrides = {}) {
  const user = await User.create({
    name: overrides.name || 'Test User',
    email: overrides.email || `user${Date.now()}${Math.random()}@test.com`,
    password: overrides.password || 'Password123!',
    role: overrides.role || 'participant',
    status: overrides.status || 'active',
  });
  return user;
}

function authHeader(user) {
  return `Bearer ${signToken(user)}`;
}

async function createEvent(organizer, overrides = {}) {
  return Event.create({
    title: overrides.title || 'Sample Event',
    description: overrides.description || 'A sample event description.',
    category: overrides.category || 'Technology',
    date: overrides.date || new Date(Date.now() + 7 * 86400000),
    startTime: overrides.startTime || '18:00',
    endTime: overrides.endTime || '21:00',
    location: overrides.location || 'Test Hall',
    capacity: overrides.capacity || 100,
    organizer: organizer._id,
    status: overrides.status || 'published',
    goingCount: overrides.goingCount || 0,
    version: overrides.version || 1,
  });
}

module.exports = { app, request, createUser, authHeader, createEvent };
