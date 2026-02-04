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

export const toggleServiceFavoriteAction = async (formData: FormData) => {
  const entityId = getString(formData, 'entity_id');
  const isFavorited = getString(formData, 'is_favorited') === 'true';

  const result = isFavorited
    ? await deleteFavorite({ entity_id: entityId, entity_type: 'SERVICE' })
    : await createFavorite({ entity_id: entityId, entity_type: 'SERVICE' });

  if (result.error) {
    redirect(`/services?error=${encodeURIComponent(result.error)}`);
  }

  redirect('/services');
};
