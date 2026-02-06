import { geocodeAddress } from '@/lib/mapbox/geocode';

describe('geocodeAddress', () => {
  it('returns coordinates when response ok', async () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'token';
    global.fetch = async () =>
      ({
        ok: true,
        json: async () => ({
          features: [{ center: [-116.2, 43.6], place_name: 'Boise, Idaho, United States' }],
        }),
      }) as Response;

    const result = await geocodeAddress('Boise, ID');
    expect(result?.latitude).toBeCloseTo(43.6);
    expect(result?.longitude).toBeCloseTo(-116.2);
  });
});
