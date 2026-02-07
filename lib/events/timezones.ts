export const EVENT_TIMEZONE_OPTIONS = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'UTC', label: 'UTC' },
] as const;

export type EventTimezoneValue = (typeof EVENT_TIMEZONE_OPTIONS)[number]['value'];

const EVENT_TIMEZONE_SET = new Set<string>(EVENT_TIMEZONE_OPTIONS.map((option) => option.value));

export const isValidEventTimezone = (value: string) => EVENT_TIMEZONE_SET.has(value);

export const DEFAULT_EVENT_TIMEZONE: EventTimezoneValue = 'America/Denver';
