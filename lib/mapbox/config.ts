import { getRequiredEnv } from '@/lib/validators/env';

export const getMapboxToken = () => getRequiredEnv('NEXT_PUBLIC_MAPBOX_TOKEN');
