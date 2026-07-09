/**
 * SubaBike reverse geocoding — resolves GPS coordinates to town/village names
 * via Mapbox Geocoding API. Includes retry logic for transient failures.
 */

interface GeocodeFeature {
  text: string;
  place_type: string[];
  properties: { short_code?: string };
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

async function geocodeOnce(lng: number, lat: number): Promise<string> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  if (!token) {
    console.warn('[SubaBike Geocode] ❌ No VITE_MAPBOX_TOKEN');
    return 'Unknown';
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?language=fr&access_token=${token}`;
  console.log('[SubaBike Geocode] 🔍 Fetching:', `${lng},${lat}`);
  const res = await fetch(url);
  console.log('[SubaBike Geocode] Response:', res.status, res.statusText);

  if (!res.ok) {
    console.warn('[SubaBike Geocode] ⚠️ Non-OK status:', res.status);
    return 'Unknown';
  }

  const data = await res.json();
  const features: GeocodeFeature[] = data.features || [];
  console.log('[SubaBike Geocode] Features found:', features.length);

  const find = (type: string) => features.find(f => f.place_type.includes(type));
  const locality = find('locality');
  const place = find('place');
  const neighborhood = find('neighborhood');
  const region = find('region');
  const country = find('country');

  if (locality && place) return locality.text;
  if (neighborhood && locality) return locality.text;
  if (neighborhood && place) return place.text;
  if (place) return place.text;
  if (region) return region.text;
  if (country) return country.text;
  if (features.length > 0) return features[0].text;

  console.warn('[SubaBike Geocode] ⚠️ No recognizable feature types found');
  return 'Unknown';
}

/** Reverse geocode with retry on failure */
export async function reverseGeocode(lng: number, lat: number): Promise<string> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const name = await geocodeOnce(lng, lat);
      if (name !== 'Unknown') return name;
      if (attempt < MAX_RETRIES) {
        console.warn(`[SubaBike Geocode] 🔄 Retry ${attempt}/${MAX_RETRIES} — got Unknown, retrying…`);
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      }
    } catch (err) {
      console.error(`[SubaBike Geocode] ❌ Attempt ${attempt} failed:`, err);
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }
  return 'Unknown';
}
