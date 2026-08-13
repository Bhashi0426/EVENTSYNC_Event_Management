const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const { app, request, createUser, authHeader, createEvent } = require('./helpers');
const rsvpService = require('../src/services/rsvpService');
const Event = require('../src/models/Event');

beforeAll(connectTestDB);
afterAll(closeTestDB);
afterEach(clearTestDB);

describe('RSVP API', () => {
  test('creates an RSVP (going)', async () => {
    const organizer = await createUser({ role: 'organizer' });
    const participant = await createUser({ role: 'participant' });
    const event = await createEvent(organizer, { capacity: 10 });

    const res = await request(app)
      .post(`/api/events/${event._id}/rsvp`)
      .set('Authorization', authHeader(participant))
      .send({ response: 'going' });

    expect(res.status).toBe(201);
    expect(res.body.data.rsvp.response).toBe('going');

    const fresh = await Event.findById(event._id);
    expect(fresh.goingCount).toBe(1);
  });

  test('updates an existing RSVP instead of duplicating', async () => {
    const organizer = await createUser({ role: 'organizer' });
    const participant = await createUser({ role: 'participant' });
    const event = await createEvent(organizer, { capacity: 10 });

    await request(app)
      .post(`/api/events/${event._id}/rsvp`)
      .set('Authorization', authHeader(participant))
      .send({ response: 'going' });

    const res = await request(app)
      .put(`/api/events/${event._id}/rsvp`)
      .set('Authorization', authHeader(participant))
      .send({ response: 'maybe' });

    expect(res.status).toBe(200);
    expect(res.body.data.rsvp.response).toBe('maybe');

    const fresh = await Event.findById(event._id);
    expect(fresh.goingCount).toBe(0); // seat released when changing away from going
  });

  test('cancels an RSVP', async () => {
    const organizer = await createUser({ role: 'organizer' });
    const participant = await createUser({ role: 'participant' });
    const event = await createEvent(organizer, { capacity: 10 });

    await request(app)
      .post(`/api/events/${event._id}/rsvp`)
      .set('Authorization', authHeader(participant))
      .send({ response: 'going' });

    const res = await request(app)
      .delete(`/api/events/${event._id}/rsvp`)
      .set('Authorization', authHeader(participant));

    expect(res.status).toBe(204);
    const fresh = await Event.findById(event._id);
    expect(fresh.goingCount).toBe(0);
  });

  test('rejects going RSVP when at capacity (409)', async () => {
    const organizer = await createUser({ role: 'organizer' });
    const p1 = await createUser({ role: 'participant', email: 'p1@test.com' });
    const p2 = await createUser({ role: 'participant', email: 'p2@test.com' });
    const event = await createEvent(organizer, { capacity: 1 });

    const first = await request(app)
      .post(`/api/events/${event._id}/rsvp`)
      .set('Authorization', authHeader(p1))
      .send({ response: 'going' });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post(`/api/events/${event._id}/rsvp`)
      .set('Authorization', authHeader(p2))
      .send({ response: 'going' });
    expect(second.status).toBe(409);
    expect(second.body.message).toMatch(/capacity/i);
  });

  test('concurrent RSVP for final seat: only one succeeds', async () => {
    const organizer = await createUser({ role: 'organizer' });
    const users = await Promise.all(
      Array.from({ length: 5 }).map((_, i) =>
        createUser({ role: 'participant', email: `c${i}@test.com` })
      )
    );
    const event = await createEvent(organizer, { capacity: 1 });

    // Fire all "going" requests concurrently.
    const results = await Promise.allSettled(
      users.map((u) => rsvpService.setRSVP(event._id.toString(), u, 'going'))
    );

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(4);

    const fresh = await Event.findById(event._id);
    expect(fresh.goingCount).toBe(1); // never exceeds capacity
  });

  test('GET /api/me/rsvps returns the user RSVPs', async () => {
    const organizer = await createUser({ role: 'organizer' });
    const participant = await createUser({ role: 'participant' });
    const event = await createEvent(organizer);

    await request(app)
      .post(`/api/events/${event._id}/rsvp`)
      .set('Authorization', authHeader(participant))
      .send({ response: 'going' });

    const res = await request(app)
      .get('/api/me/rsvps')
      .set('Authorization', authHeader(participant));

    expect(res.status).toBe(200);
    expect(res.body.data.rsvps.length).toBe(1);
  });
});
