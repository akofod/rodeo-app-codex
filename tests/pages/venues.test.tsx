import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/lib/supabase/guards', () => ({
  getOptionalUser: vi.fn().mockResolvedValue({ user: null }),
}));

vi.mock('@/lib/supabase/venues', () => ({
  getApprovedVenues: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

vi.mock('@/lib/supabase/favorites', () => ({
  getOptionalUserFavorites: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

import VenuesPublicPage from '@/app/(public)/venues/page';

describe('VenuesPublicPage', () => {
  it('renders the empty state when no venues', async () => {
    const element = await VenuesPublicPage({});
    render(element);
    expect(screen.getByRole('heading', { name: /approved venues/i })).toBeInTheDocument();
    expect(screen.getByText(/no approved venues yet/i)).toBeInTheDocument();
  });
});
