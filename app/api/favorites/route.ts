import { NextResponse } from 'next/server';

import { getErrorMessage } from '@/lib/supabase/results';
import { requireUser } from '@/lib/supabase/guards';
import type { FavoriteEntityType } from '@/types/database';

type FavoritePayload = {
  entityId: string;
  entityType: FavoriteEntityType;
  shouldFavorite: boolean;
};

const isValidEntityType = (value: unknown): value is FavoriteEntityType =>
  value === 'EVENT' || value === 'SERVICE' || value === 'VENUE';

export const POST = async (request: Request) => {
  try {
    const body = (await request.json()) as Partial<FavoritePayload>;
    const entityId = typeof body.entityId === 'string' ? body.entityId.trim() : '';
    const shouldFavorite = Boolean(body.shouldFavorite);

    if (!entityId) {
      return NextResponse.json({ error: 'Entity id is required.' }, { status: 400 });
    }

    if (!isValidEntityType(body.entityType)) {
      return NextResponse.json({ error: 'Entity type is required.' }, { status: 400 });
    }

    const { supabase, user } = await requireUser();

    if (shouldFavorite) {
      const { error } = await supabase
        .from('favorites')
        .upsert(
          { user_id: user.id, entity_id: entityId, entity_type: body.entityType },
          { onConflict: 'user_id,entity_id,entity_type' },
        );

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('entity_id', entityId)
        .eq('entity_type', body.entityType);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = getErrorMessage(error);
    const status = message === 'Authentication required.' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
};
