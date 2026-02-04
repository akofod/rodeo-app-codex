-- Allow venues to be favorited
alter table favorites drop constraint if exists favorites_entity_type_check;
alter table favorites
  add constraint favorites_entity_type_check
  check (entity_type in ('EVENT', 'SERVICE', 'VENUE'));
