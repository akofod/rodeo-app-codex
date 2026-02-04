import { getOptionalEnv } from '@/lib/validators/env';

export const siteName = 'Western Sports Hub';
export const siteDescription =
  'Discover rodeos, jackpots, and western lifestyle events across North America.';

export const getSiteUrl = () => getOptionalEnv('NEXT_PUBLIC_APP_URL') ?? 'http://localhost:3000';
