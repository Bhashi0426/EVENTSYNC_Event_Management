const BACKEND_URL = 'https://eventsync-event-management.onrender.com';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const path = req.query.path || [];
  const backendUrl = `${BACKEND_URL}/api/${Array.isArray(path) ? path.join('/') : path}`;
  const headers = new Headers();

  for (const [name, value] of Object.entries(req.headers)) {
    if (!['host', 'origin', 'content-length'].includes(name.toLowerCase()) && value) {
      headers.set(name, Array.isArray(value) ? value.join(', ') : value);
    }
  }

  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const body = hasBody && req.body !== undefined
    ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
    : undefined;

  try {
    const response = await fetch(backendUrl, {
      method: req.method,
      headers,
      body,
    });

    const responseBody = await response.arrayBuffer();
    response.headers.forEach((value, name) => {
      if (name.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(name, value);
      }
    });

    return res.status(response.status).send(Buffer.from(responseBody));
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: 'Backend service is unavailable.',
    });
  }
}
