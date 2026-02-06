import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/lib/supabase/guards', () => ({
  getOptionalUser: vi.fn().mockResolvedValue({ user: null }),
}));

vi.mock('@/lib/supabase/events', () => ({
  getApprovedEvents: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

vi.mock('@/lib/supabase/venues', () => ({
  getApprovedVenues: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

vi.mock('@/lib/supabase/favorites', () => ({
  getOptionalUserFavorites: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

vi.mock('@/lib/seo/events', () => ({
  buildEventItemListSchema: () => null,
}));

vi.mock('@/lib/mapbox/geocode', () => ({
  geocodeAddress: vi.fn().mockResolvedValue({
    latitude: 43.6,
    longitude: -116.2,
    placeName: 'Boise, Idaho, United States',
  }),
}));

import EventsPublicPage from '@/app/(public)/events/page';

describe('EventsPublicPage', () => {
  it('renders an active filter summary and empty state', async () => {
    const element = await EventsPublicPage({
      searchParams: { location: 'Boise, ID', radius: '100' },
    });

    render(element);
    expect(screen.getByText(/active filter/i)).toBeInTheDocument();
    expect(screen.getAllByText(/within 100 miles of boise/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/no events found within 100 miles/i)).toBeInTheDocument();
  });
});
