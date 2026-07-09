/**
 * Shared Upstash Redis client — lazy singleton reused across all API routes.
 *
 * Uses the same env vars as the Vercel Upstash Redis integration:
 *   fawzztv_KV_REST_API_URL  — Redis REST URL
 *   fawzztv_KV_REST_API_TOKEN — Redis REST token
 *
 * Returns null when not configured (graceful degradation).
 */

import { Redis } from '@upstash/redis';

let _redis: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  const url = process.env.fawzztv_KV_REST_API_URL;
  const token = process.env.fawzztv_KV_REST_API_TOKEN;
  _redis = url && token ? new Redis({ url, token }) : null;
  return _redis;
}
