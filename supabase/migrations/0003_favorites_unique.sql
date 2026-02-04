create unique index if not exists favorites_user_entity_unique
  on favorites (user_id, entity_id, entity_type);
