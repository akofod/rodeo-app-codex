import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/lib/supabase/guards', () => ({
  getOptionalUser: vi.fn().mockResolvedValue({ user: null }),
}));

vi.mock('@/lib/supabase/events', () => ({
  getApprovedEvents: vi.fn().mockResolvedValue({
    data: [
      {
        id: 'event-1',
        title: 'Test Rodeo',
        venue_id: 'venue-1',
        start_datetime: new Date().toISOString(),
      },
    ],
    error: null,
  }),
}));

vi.mock('@/lib/supabase/venues', () => ({
  getApprovedVenues: vi.fn().mockResolvedValue({
    data: [
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
    error: null,
  }),
}));

vi.mock('@/lib/supabase/favorites', () => ({
  getOptionalUserFavorites: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

import MapPage from '@/app/(public)/map/page';

describe('MapPage', () => {
  it('renders the map directory section', async () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = '';
    const element = await MapPage();
    render(element);
    expect(screen.getByRole('heading', { name: /live map of events and venues/i })).toBeInTheDocument();
    expect(screen.getByText(/map view/i)).toBeInTheDocument();
  });
});
