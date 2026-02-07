// @vitest-environment node

import { renderToString } from 'react-dom/server';

import MapDirectory from '@/components/maps/MapDirectory';

const markers = [
  {
    id: 'venue-1',
    type: 'VENUE' as const,
    entityId: 'venue-1',
    title: 'Boise Arena',
    subtitle: 'Boise, ID',
    latitude: 43.6,
    longitude: -116.2,
  },
  {
    id: 'event-1',
    type: 'EVENT' as const,
    title: 'Test Rodeo',
    subtitle: 'Boise, ID',
    latitude: 43.6,
    longitude: -116.2,
  },
];

describe('MapDirectory', () => {
  it('renders the list and results label', () => {
    const html = renderToString(<MapDirectory markers={markers} />);
    expect(html).toContain('2 results');
    expect(html).toContain('Boise Arena');
  });
});
