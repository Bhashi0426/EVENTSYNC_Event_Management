const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const { app, request, createUser, authHeader } = require('./helpers');

beforeAll(connectTestDB);
afterAll(closeTestDB);
afterEach(clearTestDB);

describe('Auth API', () => {
  test('registers a new user as participant', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Thilina',
      email: 'thilina@example.com',
      password: 'Password123!',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('participant');
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.token).toBeDefined();
  });

  test('never assigns admin/organizer role from client input', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Sneaky',
      email: 'sneaky@example.com',
      password: 'Password123!',
      role: 'admin',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('participant');
  });

  test('rejects duplicate email', async () => {
    await createUser({ email: 'dup@example.com' });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Dup',
      email: 'dup@example.com',
      password: 'Password123!',
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('rejects invalid registration payload', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'A',
      email: 'not-an-email',
      password: '123',
    });
    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  test('logs in with valid credentials', async () => {
    await createUser({ email: 'login@example.com', password: 'Password123!' });
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'Password123!',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  test('rejects invalid login', async () => {
    await createUser({ email: 'login2@example.com', password: 'Password123!' });
    const res = await request(app).post('/api/auth/login').send({
      email: 'login2@example.com',
      password: 'WrongPassword!',
    });
    expect(res.status).toBe(401);
  });

  test('GET /me requires auth', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /me returns current user when authenticated', async () => {
    const user = await createUser({ email: 'me@example.com' });
    const res = await request(app).get('/api/auth/me').set('Authorization', authHeader(user));
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('me@example.com');
  });
});
