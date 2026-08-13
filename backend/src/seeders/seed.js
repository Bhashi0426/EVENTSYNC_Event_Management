/* Seed the database with realistic demo data. DEVELOPMENT ONLY. */
const mongoose = require('mongoose');
const env = require('../config/env');
const logger = require('../utils/logger');
const { connectDB, disconnectDB } = require('../config/database');

const User = require('../models/User');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const Notification = require('../models/Notification');

const PASSWORD = env.DEMO_PASSWORD;

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
}

const eventTemplates = [
  { title: 'Tech Meetup 2026', category: 'Technology', location: 'Colombo Innovation Hub', capacity: 100, day: 7, startTime: '18:00', endTime: '21:00', description: 'A gathering of developers, designers, and tech enthusiasts to share ideas and network.' },
  { title: 'Startup Pitch Night', category: 'Business', location: 'WTC Auditorium', capacity: 80, day: 10, startTime: '17:30', endTime: '20:30', description: 'Watch early-stage founders pitch their startups to a panel of investors.' },
  { title: 'React Deep Dive Workshop', category: 'Technology', location: 'Online', capacity: 50, day: 3, startTime: '09:00', endTime: '13:00', description: 'Hands-on workshop covering hooks, context, and performance in modern React.' },
  { title: 'Community Health Camp', category: 'Health', location: 'Town Hall Grounds', capacity: 200, day: 14, startTime: '08:00', endTime: '16:00', description: 'Free health checkups and wellness sessions open to the whole community.' },
  { title: 'Jazz in the Park', category: 'Music', location: 'Viharamahadevi Park', capacity: 300, day: 21, startTime: '16:00', endTime: '20:00', description: 'An evening of live jazz performances under the open sky.' },
  { title: 'University Career Fair', category: 'Education', location: 'Main Campus Hall', capacity: 500, day: 5, startTime: '10:00', endTime: '17:00', description: 'Meet top employers and explore internship and graduate opportunities.' },
  { title: 'Weekend Football Cup', category: 'Sports', location: 'City Sports Complex', capacity: 60, day: 9, startTime: '07:00', endTime: '12:00', description: 'Amateur football tournament open to teams of all skill levels.' },
  { title: 'Modern Art Exhibition', category: 'Arts', location: 'National Art Gallery', capacity: 120, day: 12, startTime: '11:00', endTime: '18:00', description: 'A curated exhibition of contemporary works from emerging local artists.' },
  { title: 'AI & Ethics Panel', category: 'Technology', location: 'Faculty of Science', capacity: 40, day: 2, startTime: '15:00', endTime: '17:00', description: 'A panel discussion on the ethical implications of modern AI systems.' },
  { title: 'Neighborhood Cleanup Drive', category: 'Community', location: 'Riverside Walk', capacity: 75, day: 6, startTime: '07:30', endTime: '11:00', description: 'Join volunteers for a morning of cleaning and greening our shared spaces.' },
];

async function seed() {
  await connectDB();
  logger.info('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    RSVP.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  logger.info('Creating users...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@eventsync.com',
    password: PASSWORD,
    role: 'admin',
  });

  const organizerData = [
    { name: 'Nimal Perera', email: 'organizer@eventsync.com' },
    { name: 'Kavya Fernando', email: 'kavya.org@eventsync.com' },
    { name: 'Ruwan Silva', email: 'ruwan.org@eventsync.com' },
  ];
  const organizers = [];
  for (const o of organizerData) {
    organizers.push(await User.create({ ...o, password: PASSWORD, role: 'organizer' }));
  }

  const participantData = [
    { name: 'Participant User', email: 'participant@eventsync.com' },
    { name: 'Kasun Jayasuriya', email: 'kasun@eventsync.com' },
    { name: 'Dilani Rathnayake', email: 'dilani@eventsync.com' },
    { name: 'Thilina Wickramasinghe', email: 'thilina@eventsync.com' },
    { name: 'Sanduni Alwis', email: 'sanduni@eventsync.com' },
    { name: 'Amila Bandara', email: 'amila@eventsync.com' },
  ];
  const participants = [];
  for (const p of participantData) {
    participants.push(await User.create({ ...p, password: PASSWORD, role: 'participant' }));
  }

  logger.info('Creating events...');
  const events = [];
  for (let i = 0; i < eventTemplates.length; i += 1) {
    const t = eventTemplates[i];
    const organizer = organizers[i % organizers.length];
    events.push(
      await Event.create({
        title: t.title,
        description: t.description,
        category: t.category,
        date: daysFromNow(t.day),
        startTime: t.startTime,
        endTime: t.endTime,
        location: t.location,
        capacity: t.capacity,
        organizer: organizer._id,
        status: 'published',
        goingCount: 0,
        version: 1,
      })
    );
  }

  logger.info('Creating RSVPs...');
  const responses = ['going', 'going', 'going', 'maybe', 'not_going'];
  const allUsers = [...participants, ...organizers];
  let rsvpCount = 0;

  for (const event of events) {
    // Each event gets 3-5 RSVPs from distinct users.
    const shuffled = [...allUsers].sort(() => Math.random() - 0.5);
    const numRsvps = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < numRsvps && j < shuffled.length; j += 1) {
      const user = shuffled[j];
      if (user._id.toString() === event.organizer.toString()) continue;
      const response = responses[Math.floor(Math.random() * responses.length)];
      await RSVP.create({ event: event._id, user: user._id, response });
      if (response === 'going') {
        event.goingCount += 1;
      }
      rsvpCount += 1;
    }
    await event.save();
  }

  logger.info('Creating notifications...');
  const notifTemplates = [
    { type: 'RSVP_CREATED', title: 'New RSVP', message: 'Kasun is going to Tech Meetup 2026.' },
    { type: 'EVENT_UPDATED', title: 'Event updated', message: 'Startup Pitch Night was updated.' },
    { type: 'RSVP_CREATED', title: 'RSVP confirmed', message: 'Your RSVP for React Deep Dive Workshop is now "going".' },
    { type: 'EVENT_CAPACITY', title: 'Event almost full', message: 'AI & Ethics Panel is almost full.' },
    { type: 'EVENT_CANCELLED', title: 'Event cancelled', message: 'A draft event was cancelled.' },
  ];
  const notifRecipients = [organizers[0], participants[0], participants[1], organizers[1], participants[2]];
  let notifCount = 0;
  for (let i = 0; i < 10; i += 1) {
    const t = notifTemplates[i % notifTemplates.length];
    const recipient = notifRecipients[i % notifRecipients.length];
    await Notification.create({
      user: recipient._id,
      type: t.type,
      title: t.title,
      message: t.message,
      read: i % 3 === 0,
      relatedEvent: events[i % events.length]._id,
    });
    notifCount += 1;
  }

  logger.info('--- Seed complete ---');
  logger.info(`Users: ${1 + organizers.length + participants.length}`);
  logger.info(`Events: ${events.length}`);
  logger.info(`RSVPs: ${rsvpCount}`);
  logger.info(`Notifications: ${notifCount}`);
  logger.info('');
  logger.info('DEMO ACCOUNTS (development only):');
  logger.info(`  Admin:       admin@eventsync.com / ${PASSWORD}`);
  logger.info(`  Organizer:   organizer@eventsync.com / ${PASSWORD}`);
  logger.info(`  Participant: participant@eventsync.com / ${PASSWORD}`);

  await disconnectDB();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('Seed failed:', err);
    mongoose.disconnect().finally(() => process.exit(1));
  });
