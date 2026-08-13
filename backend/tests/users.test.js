const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const { app, request, createUser, authHeader } = require('./helpers');

beforeAll(connectTestDB);
afterAll(closeTestDB);
afterEach(clearTestDB);

describe('User API', () => {
  test('admin can list users', async () => {
    const admin = await createUser({ role: 'admin', email: 'admin@test.com' });
    await createUser({ email: 'u1@test.com' });
    const res = await request(app).get('/api/users').set('Authorization', authHeader(admin));
    expect(res.status).toBe(200);
    expect(res.body.data.users.length).toBeGreaterThanOrEqual(2);
  });

  test('non-admin cannot list users', async () => {
    const participant = await createUser({ role: 'participant' });
    const res = await request(app).get('/api/users').set('Authorization', authHeader(participant));
    expect(res.status).toBe(403);
  });

  test('admin can change a user role participant -> organizer', async () => {
    const admin = await createUser({ role: 'admin', email: 'admin2@test.com' });
    const user = await createUser({ role: 'participant', email: 'promote@test.com' });
    const res = await request(app)
      .patch(`/api/users/${user._id}/role`)
      .set('Authorization', authHeader(admin))
      .send({ role: 'organizer' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('organizer');
  });

  test('admin cannot assign admin role via role endpoint', async () => {
    const admin = await createUser({ role: 'admin', email: 'admin3@test.com' });
    const user = await createUser({ role: 'participant', email: 'noadmin@test.com' });
    const res = await request(app)
      .patch(`/api/users/${user._id}/role`)
      .set('Authorization', authHeader(admin))
      .send({ role: 'admin' });
    expect(res.status).toBe(422);
  });

  test('admin can disable a user', async () => {
    const admin = await createUser({ role: 'admin', email: 'admin4@test.com' });
    const user = await createUser({ role: 'participant', email: 'disable@test.com' });
    const res = await request(app)
      .patch(`/api/users/${user._id}/status`)
      .set('Authorization', authHeader(admin))
      .send({ status: 'disabled' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.status).toBe('disabled');
  });

  test('disabled user cannot authenticate on protected route', async () => {
    const user = await createUser({ role: 'participant', email: 'blocked@test.com', status: 'disabled' });
    const res = await request(app).get('/api/auth/me').set('Authorization', authHeader(user));
    expect(res.status).toBe(403);
  });

  test('user can update own profile', async () => {
    const user = await createUser({ role: 'participant', email: 'self@test.com' });
    const res = await request(app)
      .put(`/api/users/${user._id}`)
      .set('Authorization', authHeader(user))
      .send({ name: 'Renamed User' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe('Renamed User');
  });

  test('user cannot update another user profile', async () => {
    const a = await createUser({ email: 'a@test.com' });
    const b = await createUser({ email: 'b@test.com' });
    const res = await request(app)
      .put(`/api/users/${b._id}`)
      .set('Authorization', authHeader(a))
      .send({ name: 'Hacked' });
    expect(res.status).toBe(403);
  });
});
