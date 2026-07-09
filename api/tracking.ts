/**
 * Vercel serverless function — persists SubaBike tracking data.
 *
 * GET  /api/tracking → { steps: SubabikeStep[], ... }
 * POST /api/tracking  (body: TrackingData) → persists steps
 *
 * Uses Upstash Redis for persistence across redeploys.
 * Falls back to returning empty data if Redis is not configured.
 *
 * Setup: Install the Upstash Redis integration from Vercel Marketplace:
 *   https://vercel.com/marketplace?category=storage&search=redis
 * The integration auto-sets fawzztv_KV_REST_API_URL and fawzztv_KV_REST_API_TOKEN.
 */

import { getRedis } from './lib/redis';

const KV_KEY = 'subabike-tracking';

const CORS_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

interface TrackingData {
  steps: unknown[];
  currentDayKey: string | null;
  lastPersistTime: number | null;
}

function empty(): TrackingData {
  return { steps: [], currentDayKey: null, lastPersistTime: null };
}

// GET → load tracking data
export async function GET(): Promise<Response> {
  try {
    const redis = getRedis();
    if (!redis) {
      return new Response(JSON.stringify(empty()), { status: 200, headers: CORS_HEADERS });
    }
    const data = await redis.get<TrackingData>(KV_KEY);
    return new Response(JSON.stringify(data ?? empty()), { status: 200, headers: CORS_HEADERS });
  } catch {
    return new Response(JSON.stringify(empty()), { status: 200, headers: CORS_HEADERS });
  }
}

// POST → save tracking data
export async function POST(request: Request): Promise<Response> {
  try {
    const redis = getRedis();
    if (!redis) {
      return new Response(JSON.stringify({ ok: false, error: 'Redis not configured' }), { status: 200, headers: CORS_HEADERS });
    }
    const body = (await request.json()) as TrackingData;
    await redis.set(KV_KEY, body);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
