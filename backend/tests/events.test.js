const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const { app, request, createUser, authHeader, createEvent } = require('./helpers');

beforeAll(connectTestDB);
afterAll(closeTestDB);
afterEach(clearTestDB);

describe('Event API', () => {
  const eventPayload = {
    title: 'New Tech Event',
    description: 'An event about technology.',
    category: 'Technology',
    date: new Date(Date.now() + 5 * 86400000).toISOString(),
    startTime: '18:00',
    endTime: '20:00',
    location: 'Innovation Hub',
    capacity: 50,
  };

  test('lists events publicly', async () => {
    const organizer = await createUser({ role: 'organizer' });
    await createEvent(organizer, { title: 'Public Event' });
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body.data.events.length).toBe(1);
  });

  test('participant cannot create an event', async () => {
    const participant = await createUser({ role: 'participant' });
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', authHeader(participant))
      .send(eventPayload);
    expect(res.status).toBe(403);
  });

  test('organizer can create an event', async () => {
    const organizer = await createUser({ role: 'organizer' });
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', authHeader(organizer))
      .send(eventPayload);
    expect(res.status).toBe(201);
    expect(res.body.data.event.title).toBe('New Tech Event');
    expect(res.body.data.event.version).toBe(1);
  });

  test('gets a single event with stats', async () => {
    const organizer = await createUser({ role: 'organizer' });
    const event = await createEvent(organizer);
    const res = await request(app).get(`/api/events/${event._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.event._id).toBe(event._id.toString());
    expect(res.body.data.stats).toEqual({ going: 0, maybe: 0, not_going: 0 });
  });

  test('search filters events by keyword', async () => {
    const organizer = await createUser({ role: 'organizer' });
    await createEvent(organizer, { title: 'Cooking Class' });
    await createEvent(organizer, { title: 'Tech Summit' });
    const res = await request(app).get('/api/events?search=cooking');
    expect(res.status).toBe(200);
    expect(res.body.data.events.length).toBe(1);
    expect(res.body.data.events[0].title).toBe('Cooking Class');
  });

  test('owner organizer can update their event and version increments', async () => {
    const organizer = await createUser({ role: 'organizer' });
    const event = await createEvent(organizer, { version: 1 });
    const res = await request(app)
      .put(`/api/events/${event._id}`)
      .set('Authorization', authHeader(organizer))
      .send({ title: 'Updated Title', version: 1 });
    expect(res.status).toBe(200);
    expect(res.body.data.event.title).toBe('Updated Title');
    expect(res.body.data.event.version).toBe(2);
  });

  test('rejects update with stale version (optimistic concurrency)', async () => {
    const organizer = await createUser({ role: 'organizer' });
    const event = await createEvent(organizer, { version: 4 });
    const res = await request(app)
      .put(`/api/events/${event._id}`)
      .set('Authorization', authHeader(organizer))
      .send({ title: 'Conflict Title', version: 3 });
    expect(res.status).toBe(409);
    expect(res.body.conflict).toBe(true);
    expect(res.body.latestVersion).toBe(4);
  });

  test('non-owner organizer cannot update event', async () => {
    const owner = await createUser({ role: 'organizer', email: 'owner@test.com' });
    const other = await createUser({ role: 'organizer', email: 'other@test.com' });
    const event = await createEvent(owner);
    const res = await request(app)
      .put(`/api/events/${event._id}`)
      .set('Authorization', authHeader(other))
      .send({ title: 'Hijack', version: 1 });
    expect(res.status).toBe(403);
  });

  test('admin can update any event', async () => {
    const owner = await createUser({ role: 'organizer', email: 'owner2@test.com' });
    const admin = await createUser({ role: 'admin', email: 'admin@test.com' });
    const event = await createEvent(owner, { version: 1 });
    const res = await request(app)
      .put(`/api/events/${event._id}`)
      .set('Authorization', authHeader(admin))
      .send({ title: 'Admin Edit', version: 1 });
    expect(res.status).toBe(200);
    expect(res.body.data.event.title).toBe('Admin Edit');
  });

  test('owner can delete event', async () => {
    const organizer = await createUser({ role: 'organizer' });
    const event = await createEvent(organizer);
    const res = await request(app)
      .delete(`/api/events/${event._id}`)
      .set('Authorization', authHeader(organizer));
    expect(res.status).toBe(204);
  });
});
