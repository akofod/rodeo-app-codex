'use server';

import { redirect } from 'next/navigation';

import { createFavorite, deleteFavorite } from '@/lib/supabase/favorites';

const getString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

export const toggleEventFavoriteAction = async (formData: FormData) => {
  const entityId = getString(formData, 'entity_id');
  const isFavorited = getString(formData, 'is_favorited') === 'true';

  const result = isFavorited
    ? await deleteFavorite({ entity_id: entityId, entity_type: 'EVENT' })
    : await createFavorite({ entity_id: entityId, entity_type: 'EVENT' });

  if (result.error) {
    redirect(`/events?error=${encodeURIComponent(result.error)}`);
  }

  redirect('/events');
};
