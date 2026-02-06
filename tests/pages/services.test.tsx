import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/lib/supabase/guards', () => ({
  getOptionalUser: vi.fn().mockResolvedValue({ user: null }),
}));

vi.mock('@/lib/supabase/services', () => ({
  getApprovedServices: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

vi.mock('@/lib/supabase/favorites', () => ({
  getOptionalUserFavorites: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

import ServicesPublicPage from '@/app/(public)/services/page';

describe('ServicesPublicPage', () => {
  it('renders the empty state when no services', async () => {
    const element = await ServicesPublicPage({});
    render(element);
    expect(screen.getByRole('heading', { name: /approved service providers/i })).toBeInTheDocument();
    expect(screen.getByText(/no approved services yet/i)).toBeInTheDocument();
  });
});
