import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
      }),
    },
  }),
}));

vi.mock('@/lib/supabase/profiles', () => ({
  getProfileByUserId: vi.fn().mockResolvedValue({ data: { full_name: 'Test Rider', role: 'USER' } }),
}));

vi.mock('@/lib/supabase/favorites', () => ({
  getUserFavorites: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

vi.mock('@/lib/supabase/events', () => ({
  getUserEvents: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

vi.mock('@/lib/supabase/venues', () => ({
  getUserVenues: vi.fn().mockResolvedValue({ data: [], error: null }),
  getApprovedVenues: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

vi.mock('@/lib/supabase/services', () => ({
  getUserServices: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

vi.mock('@/lib/supabase/catalog', () => ({
  getDisciplines: vi.fn().mockResolvedValue({ data: [], error: null }),
  getSanctioningBodies: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

vi.mock('@/lib/supabase/admin-data', () => ({
  getPendingEvents: vi.fn().mockResolvedValue({ data: [], error: null }),
  getPendingVenues: vi.fn().mockResolvedValue({ data: [], error: null }),
  getPendingServices: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

vi.mock('@/app/(dashboard)/dashboard/events/EventForm', () => ({
  default: () => <div>Event form</div>,
}));

import DashboardPage from '@/app/(dashboard)/dashboard/page';
import DashboardEventsPage from '@/app/(dashboard)/dashboard/events/page';
import DashboardVenuesPage from '@/app/(dashboard)/dashboard/venues/page';
import DashboardServicesPage from '@/app/(dashboard)/dashboard/services/page';
import AdminPage from '@/app/(dashboard)/admin/page';

describe('Dashboard pages', () => {
  it('renders the main dashboard page', async () => {
    const element = await DashboardPage();
    render(element);
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('renders the dashboard events page', async () => {
    const element = await DashboardEventsPage({});
    render(element);
    expect(screen.getByRole('heading', { name: /manage your events/i })).toBeInTheDocument();
  });

  it('renders the dashboard venues page', async () => {
    const element = await DashboardVenuesPage({});
    render(element);
    expect(screen.getByRole('heading', { name: /manage your venues/i })).toBeInTheDocument();
  });

  it('renders the dashboard services page', async () => {
    const element = await DashboardServicesPage({});
    render(element);
    expect(screen.getByRole('heading', { name: /manage your services/i })).toBeInTheDocument();
  });

  it('renders the admin page', async () => {
    const element = await AdminPage({});
    render(element);
    expect(screen.getByRole('heading', { name: /review submissions/i })).toBeInTheDocument();
  });
});
