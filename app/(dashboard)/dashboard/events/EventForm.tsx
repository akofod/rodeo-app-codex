'use client';

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';

import type { Discipline, SanctioningBody, Venue } from '@/types/database';

import { createEventAction } from './actions';

type RecurrenceType = 'NONE' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY_DATE' | 'MONTHLY_DAY' | 'CUSTOM';

type PerformanceEntry = {
  id: string;
  date: string;
  time: string;
};

type CustomRecurrence = {
  id: string;
  date: string;
};

type VenueMode = 'EXISTING' | 'NEW';

type VenueOption =
  | {
      type: 'venue';
      venue: Venue;
    }
  | {
      type: 'new';
    };

type EventFormProps = {
  venues: Venue[];
  disciplines: Discipline[];
  sanctioningBodies: SanctioningBody[];
};

const pad = (value: number) => value.toString().padStart(2, '0');

const formatDateValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatTimeValue = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const roundToQuarterHour = (value: number) => Math.round(value / 15) * 15;

const normalizeSearch = (value: string) => value.trim().toLowerCase();

const formatVenueAddress = (venue: Venue) => {
  const country = venue.address_country ? `, ${venue.address_country}` : '';
  return `${venue.address_street}, ${venue.address_city}, ${venue.address_state} ${venue.address_zip}${country}`;
};

const dateTimeInputClass =
  'rounded-xl border border-white/10 bg-night-950/80 px-3 py-2 text-sm text-slate-100 shadow-inner shadow-black/20 transition focus:border-brand-300/60 focus:outline-none focus:ring-2 focus:ring-brand-400/30';

const createPerformance = (id: string, date?: Date): PerformanceEntry => {
  const base = date ?? new Date();
  const roundedMinutes = roundToQuarterHour(base.getMinutes());
  const roundedDate = new Date(base);
  roundedDate.setMinutes(roundedMinutes, 0, 0);

  return {
    id,
    date: formatDateValue(roundedDate),
    time: formatTimeValue(roundedDate),
  };
};

const createCustomRecurrence = (id: string, date?: Date): CustomRecurrence => {
  const base = date ?? new Date();
  return {
    id,
    date: formatDateValue(base),
  };
};

const parseLocalDateTime = (date: string, time: string) => {
  if (!date || !time) {
    return null;
  }

  const [year, month, day] = date.split('-').map((value) => Number.parseInt(value, 10));
  const [hour, minute] = time.split(':').map((value) => Number.parseInt(value, 10));

  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute, 0, 0);
};

const getBaseStartDate = (performances: PerformanceEntry[]) => {
  const baseDates = performances
    .map((performance) => parseLocalDateTime(performance.date, performance.time))
    .filter((value): value is Date => Boolean(value))
    .sort((left, right) => left.getTime() - right.getTime());

  return baseDates[0] ?? null;
};

const getEndOfDay = (date: string) => {
  const parsed = parseLocalDateTime(date, '23:59');
  if (!parsed) {
    return null;
  }
  parsed.setSeconds(59, 999);
  return parsed;
};

const addDays = (date: Date, days: number) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
    date.getHours(),
    date.getMinutes(),
  );

const getNthWeekdayOfMonth = (year: number, monthIndex: number, weekday: number, nth: number) => {
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const offset = (weekday - firstDay + 7) % 7;
  const day = 1 + offset + (nth - 1) * 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  if (day > daysInMonth) {
    return null;
  }

  return day;
};

const buildOccurrences = (
  performances: PerformanceEntry[],
  recurrenceType: RecurrenceType,
  recurrenceEndDate: string,
  customRecurrenceDates: string[],
) => {
  const baseDates = performances
    .map((performance) => parseLocalDateTime(performance.date, performance.time))
    .filter((value): value is Date => Boolean(value));

  if (baseDates.length === 0) {
    return [];
  }

  const baseStart = baseDates.reduce(
    (earliest, current) => (current < earliest ? current : earliest),
    baseDates[0],
  );
  const scheduleOffsets = baseDates.map((date) => date.getTime() - baseStart.getTime());
  const startDates = [baseStart];
  const uniqueDates = new Map<string, Date>();

  const pushSchedule = (startDate: Date) => {
    scheduleOffsets.forEach((offset) => {
      const occurrence = new Date(startDate.getTime() + offset);
      uniqueDates.set(occurrence.toISOString(), occurrence);
    });
  };

  if (recurrenceType === 'CUSTOM') {
    const baseTime = formatTimeValue(baseStart);
    customRecurrenceDates
      .map((date) => parseLocalDateTime(date, baseTime))
      .filter((value): value is Date => Boolean(value))
      .forEach((date) => startDates.push(date));

    startDates.forEach(pushSchedule);
    return Array.from(uniqueDates.values()).sort((left, right) => left.getTime() - right.getTime());
  }

  if (recurrenceType === 'NONE') {
    startDates.forEach(pushSchedule);
    return Array.from(uniqueDates.values()).sort((left, right) => left.getTime() - right.getTime());
  }

  const endDate = getEndOfDay(recurrenceEndDate);

  if (!endDate) {
    startDates.forEach(pushSchedule);
    return Array.from(uniqueDates.values()).sort((left, right) => left.getTime() - right.getTime());
  }

  if (recurrenceType === 'WEEKLY' || recurrenceType === 'BIWEEKLY') {
    const step = recurrenceType === 'WEEKLY' ? 7 : 14;
    let next = addDays(baseStart, step);
    while (next <= endDate) {
      startDates.push(next);
      next = addDays(next, step);
    }
  }

  if (recurrenceType === 'MONTHLY_DATE') {
    const day = baseStart.getDate();
    let year = baseStart.getFullYear();
    let month = baseStart.getMonth();
    const hours = baseStart.getHours();
    const minutes = baseStart.getMinutes();

    while (true) {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
      const candidate = new Date(year, month, day, hours, minutes, 0, 0);
      if (candidate.getMonth() !== month) {
        continue;
      }
      if (candidate > endDate) {
        break;
      }
      startDates.push(candidate);
    }
  }

  if (recurrenceType === 'MONTHLY_DAY') {
    const weekday = baseStart.getDay();
    const nth = Math.floor((baseStart.getDate() - 1) / 7) + 1;
    let year = baseStart.getFullYear();
    let month = baseStart.getMonth();
    const hours = baseStart.getHours();
    const minutes = baseStart.getMinutes();

    while (true) {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }

      const day = getNthWeekdayOfMonth(year, month, weekday, nth);
      if (!day) {
        continue;
      }

      const candidate = new Date(year, month, day, hours, minutes, 0, 0);
      if (candidate > endDate) {
        break;
      }

      startDates.push(candidate);
    }
  }

  startDates.forEach(pushSchedule);

  return Array.from(uniqueDates.values()).sort((left, right) => left.getTime() - right.getTime());
};

type DateTimeFieldProps = {
  label: string;
  value: PerformanceEntry;
  onChange: (value: PerformanceEntry) => void;
  onRemove?: () => void;
};

const DateTimeField = ({ label, value, onChange, onRemove }: DateTimeFieldProps) => (
  <div className="rounded-2xl border border-white/10 bg-night-900/70 p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-semibold text-slate-100">{label}</p>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="text-xs uppercase tracking-[0.2em] text-slate-400 hover:text-slate-100"
        >
          Remove
        </button>
      ) : null}
    </div>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
        Date
        <input
          type="date"
          id={`${value.id}-date`}
          name={`performance_date_${value.id}`}
          value={value.date}
          onChange={(event) => onChange({ ...value, date: event.target.value })}
          className={dateTimeInputClass}
        />
      </label>
      <label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
        Time
        <input
          type="time"
          id={`${value.id}-time`}
          name={`performance_time_${value.id}`}
          value={value.time}
          step={900}
          onChange={(event) => onChange({ ...value, time: event.target.value })}
          className={dateTimeInputClass}
        />
      </label>
    </div>
  </div>
);

export default function EventForm({ venues, disciplines, sanctioningBodies }: EventFormProps) {
  const idPrefix = useId();
  const idCounter = useRef(0);
  const customRecurrenceCounter = useRef(0);
  const nextPerformanceId = () => {
    idCounter.current += 1;
    return `${idPrefix}-performance-${idCounter.current}`;
  };
  const nextCustomRecurrenceId = () => {
    customRecurrenceCounter.current += 1;
    return `${idPrefix}-custom-recurrence-${customRecurrenceCounter.current}`;
  };
  const [performances, setPerformances] = useState<PerformanceEntry[]>(() => [
    createPerformance(nextPerformanceId()),
  ]);
  const [venueQuery, setVenueQuery] = useState('');
  const [venueMode, setVenueMode] = useState<VenueMode>('EXISTING');
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [isVenueListOpen, setIsVenueListOpen] = useState(false);
  const [activeVenueIndex, setActiveVenueIndex] = useState<number | null>(null);
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('WEEKLY');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [recurrenceNote, setRecurrenceNote] = useState('');
  const [customRecurrences, setCustomRecurrences] = useState<CustomRecurrence[]>([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState<number[]>([]);
  const [selectedSanctions, setSelectedSanctions] = useState<number[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);
  const venueListId = `${idPrefix}-venue-list`;
  const baseStart = useMemo(() => getBaseStartDate(performances), [performances]);
  const filteredVenues = useMemo(() => {
    const query = normalizeSearch(venueQuery);
    if (!query) {
      return venues;
    }

    return venues.filter((venue) => {
      const haystack = normalizeSearch(
        [
          venue.name,
          venue.address_street,
          venue.address_city,
          venue.address_state,
          venue.address_zip,
          venue.address_country,
        ].join(' '),
      );
      return haystack.includes(query);
    });
  }, [venueQuery, venues]);
  const venueOptions = useMemo<VenueOption[]>(
    () => [...filteredVenues.map((venue) => ({ type: 'venue' as const, venue })), { type: 'new' }],
    [filteredVenues],
  );
  const selectedVenue = useMemo(
    () => venues.find((venue) => venue.id === selectedVenueId) ?? null,
    [venues, selectedVenueId],
  );

  const effectiveRecurrenceType = recurrenceEnabled ? recurrenceType : 'NONE';
  const occurrences = useMemo(
    () =>
      buildOccurrences(
        performances,
        effectiveRecurrenceType,
        recurrenceEndDate,
        customRecurrences.map((recurrence) => recurrence.date),
      ),
    [performances, effectiveRecurrenceType, recurrenceEndDate, customRecurrences],
  );

  const handlePerformanceChange = (entry: PerformanceEntry) => {
    setPerformances((current) =>
      current.map((performance) => (performance.id === entry.id ? entry : performance)),
    );
  };

  const handleAddPerformance = () => {
    setPerformances((current) => [...current, createPerformance(nextPerformanceId())]);
  };

  const handleRemovePerformance = (id: string) => {
    setPerformances((current) => current.filter((performance) => performance.id !== id));
  };

  const handleAddCustomRecurrence = () => {
    setCustomRecurrences((current) => [
      ...current,
      createCustomRecurrence(nextCustomRecurrenceId(), baseStart ?? new Date()),
    ]);
  };

  const handleRemoveCustomRecurrence = (id: string) => {
    setCustomRecurrences((current) => current.filter((recurrence) => recurrence.id !== id));
  };

  const handleCustomRecurrenceChange = (entry: CustomRecurrence) => {
    setCustomRecurrences((current) =>
      current.map((recurrence) => (recurrence.id === entry.id ? entry : recurrence)),
    );
  };

  const handleVenueInputChange = (value: string) => {
    setVenueQuery(value);
    if (venueMode === 'EXISTING') {
      setSelectedVenueId('');
    }
    setIsVenueListOpen(true);
    setActiveVenueIndex(null);
  };

  const handleSelectVenue = (venue: Venue) => {
    setSelectedVenueId(venue.id);
    setVenueQuery(venue.name);
    setVenueMode('EXISTING');
    setIsVenueListOpen(false);
  };

  const handleSelectNewVenue = () => {
    setSelectedVenueId('');
    setVenueMode('NEW');
    setIsVenueListOpen(false);
    setActiveVenueIndex(null);
  };

  useEffect(() => {
    if (!isVenueListOpen) {
      setActiveVenueIndex(null);
      return;
    }

    if (venueOptions.length === 0) {
      setActiveVenueIndex(null);
      return;
    }

    setActiveVenueIndex((current) => {
      if (current === null || current >= venueOptions.length) {
        return 0;
      }
      return current;
    });
  }, [isVenueListOpen, venueOptions.length]);

  const toggleSelection = (value: number, selected: number[], setter: (next: number[]) => void) => {
    if (selected.includes(value)) {
      setter(selected.filter((item) => item !== value));
      return;
    }

    setter([...selected, value]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setClientError(null);

    if (venueMode === 'EXISTING' && !selectedVenueId) {
      setClientError('Select a venue or add a new one before submitting.');
      event.preventDefault();
      return;
    }

    if (venueMode === 'NEW' && !venueQuery.trim()) {
      setClientError('Enter a name for the new venue.');
      event.preventDefault();
      return;
    }

    if (performances.length === 0) {
      setClientError('Add at least one performance date and time.');
      event.preventDefault();
      return;
    }

    const latestBase = performances
      .map((performance) => parseLocalDateTime(performance.date, performance.time))
      .filter((value): value is Date => Boolean(value))
      .sort((left, right) => right.getTime() - left.getTime())[0];

    if (!latestBase) {
      setClientError('Add a valid date and time for each performance.');
      event.preventDefault();
      return;
    }

    if (
      effectiveRecurrenceType !== 'NONE' &&
      effectiveRecurrenceType !== 'CUSTOM' &&
      !recurrenceEndDate
    ) {
      setClientError('Select an end date for the recurrence.');
      event.preventDefault();
      return;
    }

    if (recurrenceEnabled && recurrenceEndDate) {
      const endDate = getEndOfDay(recurrenceEndDate);
      if (!endDate) {
        setClientError('Select a valid recurrence end date.');
        event.preventDefault();
        return;
      }

      if (latestBase > endDate) {
        setClientError('Recurrence end date must be on or after the last performance.');
        event.preventDefault();
        return;
      }
    }

    if (occurrences.length === 0) {
      setClientError('Add at least one performance date and time.');
      event.preventDefault();
    }
  };

  return (
    <form action={createEventAction} onSubmit={handleSubmit} className="mt-6 grid gap-6">
      {clientError ? (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {clientError}
        </div>
      ) : null}

      <label className="grid gap-2 text-sm text-slate-300">
        Event title
        <input
          type="text"
          name="title"
          required
          className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
        />
      </label>

      <div className="grid gap-2 text-sm text-slate-300">
        <label className="grid gap-2">
          Venue
          <div className="relative">
            <input
              type="text"
              name="venue_name"
              value={venueQuery}
              onChange={(event) => handleVenueInputChange(event.target.value)}
              onFocus={() => setIsVenueListOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setIsVenueListOpen(false), 150);
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  event.preventDefault();
                  if (!isVenueListOpen) {
                    setIsVenueListOpen(true);
                  }
                  const maxIndex = venueOptions.length;
                  if (maxIndex === 0) {
                    return;
                  }
                  setActiveVenueIndex((current) => {
                    if (current === null) {
                      return event.key === 'ArrowUp' ? maxIndex - 1 : 0;
                    }
                    if (event.key === 'ArrowDown') {
                      return (current + 1) % maxIndex;
                    }
                    return (current - 1 + maxIndex) % maxIndex;
                  });
                  return;
                }

                if (event.key === 'Enter' && isVenueListOpen) {
                  event.preventDefault();
                  if (venueOptions.length === 0) {
                    return;
                  }
                  const index = activeVenueIndex ?? 0;
                  const option = venueOptions[index];
                  if (option?.type === 'venue') {
                    handleSelectVenue(option.venue);
                  } else {
                    handleSelectNewVenue();
                  }
                  return;
                }

                if (event.key === 'Escape') {
                  setIsVenueListOpen(false);
                  setActiveVenueIndex(null);
                }
              }}
              role="combobox"
              aria-expanded={isVenueListOpen}
              aria-controls={venueListId}
              aria-autocomplete="list"
              aria-activedescendant={
                activeVenueIndex !== null ? `${venueListId}-option-${activeVenueIndex}` : undefined
              }
              placeholder="Search venues or add a new one"
              className="w-full rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
            />
            <input type="hidden" name="venue_id" value={selectedVenueId} />
            <input type="hidden" name="venue_mode" value={venueMode} />
            {isVenueListOpen ? (
              <div
                id={venueListId}
                role="listbox"
                className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-night-900/95 shadow-glow"
              >
                {filteredVenues.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-400">No matching venues yet.</div>
                ) : null}
                <div className="max-h-64 overflow-auto">
                  {venueOptions.map((option, index) => {
                    const isActive = index === activeVenueIndex;
                    const baseClass =
                      'flex w-full flex-col gap-1 px-4 py-3 text-left text-sm transition';
                    const activeClass = isActive ? 'bg-white/10' : 'hover:bg-white/10';
                    if (option.type === 'venue') {
                      return (
                        <button
                          key={option.venue.id}
                          id={`${venueListId}-option-${index}`}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setActiveVenueIndex(index)}
                          onClick={() => handleSelectVenue(option.venue)}
                          className={`${baseClass} border-b border-white/5 text-slate-200 ${activeClass}`}
                        >
                          <span className="font-semibold text-slate-100">{option.venue.name}</span>
                          <span className="text-xs text-slate-400">
                            {formatVenueAddress(option.venue)}
                          </span>
                        </button>
                      );
                    }

                    return (
                      <button
                        key="venue-option-new"
                        id={`${venueListId}-option-${index}`}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseEnter={() => setActiveVenueIndex(index)}
                        onClick={handleSelectNewVenue}
                        className={`${baseClass} text-brand-100 ${activeClass}`}
                      >
                        <span className="font-semibold">
                          {venueQuery.trim()
                            ? `Add "${venueQuery.trim()}" as a new venue`
                            : 'Add a new venue'}
                        </span>
                        <span className="text-xs text-slate-400">
                          Submit a venue for approval if it is not listed yet.
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </label>

        {selectedVenue && venueMode === 'EXISTING' ? (
          <p className="text-xs text-slate-400">
            Selected: {selectedVenue.name} - {formatVenueAddress(selectedVenue)}
          </p>
        ) : null}

        {venues.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-3 text-xs text-slate-400">
            No venues found yet. Add a new venue below to submit this event.
          </p>
        ) : null}
      </div>

      {venueMode === 'NEW' ? (
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-night-900/60 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-100">New venue details</p>
            <p className="text-xs text-slate-400">
              We will submit this venue for approval alongside your event.
            </p>
          </div>
          <label className="grid gap-2 text-sm text-slate-300">
            Street address
            <input
              type="text"
              name="venue_address_street"
              required={venueMode === 'NEW'}
              className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-300">
              City
              <input
                type="text"
                name="venue_address_city"
                required={venueMode === 'NEW'}
                className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">
              State
              <input
                type="text"
                name="venue_address_state"
                required={venueMode === 'NEW'}
                className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-300">
              ZIP code
              <input
                type="text"
                name="venue_address_zip"
                required={venueMode === 'NEW'}
                className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">
              Country
              <select
                name="venue_address_country"
                required={venueMode === 'NEW'}
                defaultValue="United States"
                className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="Mexico">Mexico</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm text-slate-300">
              Venue website (optional)
              <input
                type="url"
                name="venue_website_url"
                className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
              />
            </label>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-100">Performance schedule</p>
            <p className="text-xs text-slate-400">
              Add each performance date and time. Multi-day events can include multiple performances
              per day.
            </p>
          </div>
          <span className="rounded-full border border-brand-400/40 bg-brand-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-brand-100">
            {occurrences.length} occurrences
          </span>
        </div>

        <div className="grid gap-3">
          {performances.map((performance, index) => (
            <DateTimeField
              key={performance.id}
              label={`Performance ${index + 1}`}
              value={performance}
              onChange={handlePerformanceChange}
              onRemove={
                performances.length > 1 ? () => handleRemovePerformance(performance.id) : undefined
              }
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddPerformance}
          className="w-fit rounded-full border border-white/10 bg-night-900/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 hover:bg-white/10"
        >
          Add performance
        </button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-night-900/60 p-4">
        <div>
          <p className="text-sm font-semibold text-slate-100">Recurrence</p>
          <p className="text-xs text-slate-400">
            Recurring events are expanded into individual performances at submission time.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-200">
          <input
            type="checkbox"
            id={`${idPrefix}-recurrence-enabled`}
            name="recurrence_enabled"
            checked={recurrenceEnabled}
            onChange={(event) => {
              const enabled = event.target.checked;
              setRecurrenceEnabled(enabled);
              if (!enabled) {
                setRecurrenceEndDate('');
              }
            }}
            className="h-4 w-4 accent-brand-400"
          />
          Recurring event
        </label>

        {recurrenceEnabled ? (
          <label className="grid gap-2 text-sm text-slate-300">
            Recurrence pattern
            <select
              name="recurrence_type"
              value={recurrenceType}
              onChange={(event) => setRecurrenceType(event.target.value as RecurrenceType)}
              className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
            >
              <option value="WEEKLY">Weekly</option>
              <option value="BIWEEKLY">Every two weeks</option>
              <option value="MONTHLY_DATE">Monthly on the same date</option>
              <option value="MONTHLY_DAY">Monthly on the same weekday</option>
              <option value="CUSTOM">Custom (manual schedule)</option>
            </select>
          </label>
        ) : null}

        {recurrenceEnabled && recurrenceType !== 'CUSTOM' ? (
          <label className="grid gap-2 text-sm text-slate-300">
            Recurrence end date
            <input
              type="date"
              id={`${idPrefix}-recurrence-end`}
              name="recurrence_end_date"
              value={recurrenceEndDate}
              onChange={(event) => setRecurrenceEndDate(event.target.value)}
              className={dateTimeInputClass}
            />
          </label>
        ) : null}

        {recurrenceEnabled && recurrenceType === 'CUSTOM' ? (
          <div className="grid gap-3">
            <p className="text-xs text-slate-400">
              Add each additional start date for this event. Every date uses the full performance
              schedule above.
            </p>

            {customRecurrences.length === 0 ? (
              <p className="text-xs text-slate-500">No custom recurrence dates added yet.</p>
            ) : null}

            {customRecurrences.map((recurrence, index) => (
              <div
                key={recurrence.id}
                className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-night-900/70 p-3"
              >
                <label className="grid flex-1 gap-2 text-sm text-slate-300">
                  Additional start date {index + 1}
                  <input
                    type="date"
                    id={`${recurrence.id}-date`}
                    name={`custom_recurrence_${recurrence.id}`}
                    value={recurrence.date}
                    onChange={(event) =>
                      handleCustomRecurrenceChange({ ...recurrence, date: event.target.value })
                    }
                    className={dateTimeInputClass}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomRecurrence(recurrence.id)}
                  className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300 hover:text-slate-100"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddCustomRecurrence}
              className="w-fit rounded-full border border-white/10 bg-night-900/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 hover:bg-white/10"
            >
              Add recurrence date
            </button>

            <label className="grid gap-2 text-sm text-slate-300">
              Custom recurrence note (optional)
              <input
                type="text"
                name="recurrence_note"
                value={recurrenceNote}
                onChange={(event) => setRecurrenceNote(event.target.value)}
                placeholder="e.g., Every third Friday during summer"
                className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
              />
            </label>
          </div>
        ) : null}

        {recurrenceEnabled && occurrences.length > 0 ? (
          <p className="text-xs text-slate-400">
            {occurrences.length} performances will be created based on your schedule.
          </p>
        ) : null}
      </div>

      {occurrences.map((occurrence) => (
        <input
          key={occurrence.toISOString()}
          type="hidden"
          name="occurrence"
          value={occurrence.toISOString()}
        />
      ))}

      <div className="grid gap-2 text-sm text-slate-300">
        Description (optional)
        <textarea
          name="description"
          rows={3}
          className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
        />
      </div>

      <div className="grid gap-2 text-sm text-slate-300">
        Classes/Divisions (optional)
        <textarea
          name="classes_details"
          rows={2}
          className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
        />
      </div>

      <div className="grid gap-2 text-sm text-slate-300">
        Flyer image URL (optional)
        <input
          type="url"
          name="flyer_image_url"
          className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
        />
      </div>

      <div className="grid gap-2 text-sm text-slate-300">
        Official website URL (optional)
        <input
          type="url"
          name="official_website_url"
          className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
        />
      </div>

      <div className="grid gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-100">Disciplines</p>
          <p className="text-xs text-slate-400">Select every discipline featured at this event.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {disciplines.map((discipline) => (
            <label
              key={discipline.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-night-900/60 px-3 py-2 text-sm text-slate-200"
            >
              <input
                type="checkbox"
                name="discipline_ids"
                value={discipline.id}
                checked={selectedDisciplines.includes(discipline.id)}
                onChange={() =>
                  toggleSelection(discipline.id, selectedDisciplines, setSelectedDisciplines)
                }
                className="h-4 w-4 accent-brand-400"
              />
              <span>{discipline.name}</span>
            </label>
          ))}
          {disciplines.length === 0 ? (
            <p className="text-xs text-slate-400">No disciplines configured yet.</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-100">Sanctioning organizations</p>
          <p className="text-xs text-slate-400">Choose any sanctioning bodies for this event.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {sanctioningBodies.map((body) => (
            <label
              key={body.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-night-900/60 px-3 py-2 text-sm text-slate-200"
            >
              <input
                type="checkbox"
                name="sanction_ids"
                value={body.id}
                checked={selectedSanctions.includes(body.id)}
                onChange={() => toggleSelection(body.id, selectedSanctions, setSelectedSanctions)}
                className="h-4 w-4 accent-brand-400"
              />
              <span>{body.name}</span>
            </label>
          ))}
          {sanctioningBodies.length === 0 ? (
            <p className="text-xs text-slate-400">No sanctioning bodies configured yet.</p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        className="mt-2 rounded-full border border-brand-400/50 bg-brand-400/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30"
      >
        Submit event
      </button>
    </form>
  );
}
