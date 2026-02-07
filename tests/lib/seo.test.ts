import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildEventItemListSchema } from '@/lib/seo/events';
import { getSiteUrl, siteDescription, siteName } from '@/lib/seo/site';

describe('SEO helpers', () => {
  it('builds page metadata', () => {
    const metadata = buildPageMetadata({
      title: 'Events',
      description: 'Browse events',
      path: '/events',
    });

    expect(metadata.title).toBe('Events');
    expect(metadata.description).toBe('Browse events');
  });

  it('builds event schema when venues have coordinates', () => {
    const schema = buildEventItemListSchema(
      [
        {
          id: 'event-1',
          title: 'Test Rodeo',
          start_datetime: new Date().toISOString(),
          end_datetime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          timezone: 'America/Denver',
          venue_id: 'venue-1',
        },
      ],
      [
        {
          id: 'venue-1',
          name: 'Test Arena',
          address_city: 'Boise',
          address_state: 'ID',
          address_country: 'USA',
          latitude: 43.6,
          longitude: -116.2,
        },
      ],
    );

    expect(schema).toBeTruthy();
  });

  it('returns site metadata defaults', () => {
    expect(siteName).toBe('Western Sports Hub');
    expect(siteDescription).toMatch(/western/i);
    expect(getSiteUrl()).toMatch(/^http/);
  });
});
