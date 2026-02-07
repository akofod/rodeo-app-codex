alter table events
  add column if not exists end_datetime timestamptz,
  add column if not exists timezone text;

update events
set
  end_datetime = coalesce(end_datetime, start_datetime + interval '2 hours'),
  timezone = coalesce(timezone, 'America/Denver');

alter table events
  alter column end_datetime set not null,
  alter column timezone set not null;

alter table events
  drop constraint if exists events_end_after_start;

alter table events
  add constraint events_end_after_start check (end_datetime > start_datetime);
