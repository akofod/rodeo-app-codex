import * as admin from '@/lib/supabase/admin';
import * as adminData from '@/lib/supabase/admin-data';
import * as catalog from '@/lib/supabase/catalog';
import * as client from '@/lib/supabase/client';
import * as cookieStorage from '@/lib/supabase/cookie-storage';
import * as env from '@/lib/supabase/env';
import * as events from '@/lib/supabase/events';
import * as favorites from '@/lib/supabase/favorites';
import * as guards from '@/lib/supabase/guards';
import * as profiles from '@/lib/supabase/profiles';
import * as results from '@/lib/supabase/results';
import * as server from '@/lib/supabase/server';
import * as serverActions from '@/lib/supabase/server-actions';
import * as services from '@/lib/supabase/services';
import * as venues from '@/lib/supabase/venues';

describe('supabase modules', () => {
  it('exposes core helpers and services', () => {
    expect(typeof env.getSupabaseEnv).toBe('function');
    expect(typeof client.createSupabaseBrowserClient).toBe('function');
    expect(typeof server.createSupabaseServerClient).toBe('function');
    expect(typeof serverActions.createSupabaseServerActionClient).toBe('function');
    expect(typeof results.toDataResult).toBe('function');
    expect(typeof results.toErrorResult).toBe('function');
    expect(typeof guards.requireUser).toBe('function');
    expect(typeof guards.getOptionalUser).toBe('function');
    expect(typeof profiles.getProfileByUserId).toBe('function');
    expect(typeof favorites.getUserFavorites).toBe('function');
    expect(typeof events.getApprovedEvents).toBe('function');
    expect(typeof venues.getApprovedVenues).toBe('function');
    expect(typeof services.getApprovedServices).toBe('function');
    expect(typeof catalog.getDisciplines).toBe('function');
    expect(typeof adminData.getPendingEvents).toBe('function');
    expect(typeof admin.requireSupabaseAdminClient).toBe('function');
    expect(typeof cookieStorage.createSupabaseCookieStorage).toBe('function');
  });
});
