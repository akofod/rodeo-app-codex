import { renderToString } from 'react-dom/server';
import { vi } from 'vitest';
import React from 'react';

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  }),
}));

import RootLayout from '@/app/layout';

describe('RootLayout', () => {
  it('renders html shell with children', async () => {
    const element = await RootLayout({ children: React.createElement('div', null, 'Child') });
    const html = renderToString(element);
    expect(html).toContain('Western Sports Hub');
    expect(html).toContain('Child');
  });
});
