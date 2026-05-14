// Generic CRUD endpoint backed by Netlify Blobs
// Read: GET  /api/data?key=elus           (public)
// Write: POST /api/data?key=elus          (admin only, bearer token)
// Delete: DELETE /api/data?key=elus       (admin only)
import { getStore } from '@netlify/blobs';

const STORE = 'unsa-sulo';

function isAdmin(req) {
  const adminPw = Netlify.env.get('ADMIN_PASSWORD') || 'unsa-sulo-2026';
  const auth = req.headers.get('Authorization') || '';
  return auth === `Bearer ${adminPw}`;
}

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get('key');
  if (!key) return Response.json({ error: 'Missing key' }, { status: 400 });
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(key)) {
    return Response.json({ error: 'Invalid key' }, { status: 400 });
  }

  const store = getStore(STORE);

  if (req.method === 'GET') {
    try {
      const value = await store.get(key);
      return Response.json({ value: value ? JSON.parse(value) : null });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    if (!isAdmin(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    try {
      const body = await req.json();
      await store.set(key, JSON.stringify(body.value ?? null));
      return Response.json({ ok: true });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  if (req.method === 'DELETE') {
    if (!isAdmin(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    try {
      await store.delete(key);
      return Response.json({ ok: true });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = { path: '/api/data' };
