import 'server-only';

import { getMapboxToken } from './config';

type GeocodeResult = {
  latitude: number;
  longitude: number;
  placeName: string;
};

export const geocodeAddress = async (address: string): Promise<GeocodeResult | null> => {
  const token = getMapboxToken();
  const endpoint = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
  );

  endpoint.searchParams.set('access_token', token);
  endpoint.searchParams.set('limit', '1');

  const response = await fetch(endpoint.toString(), {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    features?: Array<{ center?: [number, number]; place_name?: string }>;
  };

  const feature = payload.features?.[0];

  if (!feature?.center || feature.center.length < 2) {
    return null;
  }

  const [longitude, latitude] = feature.center;

  return {
    latitude,
    longitude,
    placeName: feature.place_name ?? address,
  };
};
