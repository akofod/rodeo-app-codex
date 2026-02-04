'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import MapboxMap, { type MapMarker } from './MapboxMap';

type MapDirectoryProps = {
  markers: MapMarker[];
  favoriteVenueIds?: string[];
  isSignedIn?: boolean;
  userId?: string | null;
};

const typeStyles: Record<MapMarker['type'], string> = {
  EVENT: 'bg-brand-400/20 text-brand-100 border border-brand-400/40',
  VENUE: 'bg-red-500/20 text-red-100 border border-red-400/40',
};

export default function MapDirectory({
  markers,
  favoriteVenueIds = [],
  isSignedIn = false,
  userId,
}: MapDirectoryProps) {
  const [query, setQuery] = useState('');
  const [favoriteSet, setFavoriteSet] = useState<Set<string>>(() => new Set(favoriteVenueIds));

  useEffect(() => {
    setFavoriteSet(new Set(favoriteVenueIds));
  }, [favoriteVenueIds]);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return markers;
    }
    const normalized = query.toLowerCase();
    return markers.filter(
      (marker) =>
        marker.title.toLowerCase().includes(normalized) ||
        marker.subtitle.toLowerCase().includes(normalized),
    );
  }, [markers, query]);

  const resultsLabel = query.trim()
    ? `${filtered.length} shown of ${markers.length}`
    : `${markers.length} total`;

  const handleToggleVenueFavorite = useCallback(
    async (venueId: string, shouldFavorite: boolean) => {
      if (!userId) {
        return;
      }

      setFavoriteSet((prev) => {
        const next = new Set(prev);
        if (shouldFavorite) {
          next.add(venueId);
        } else {
          next.delete(venueId);
        }
        return next;
      });

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          entityId: venueId,
          entityType: 'VENUE',
          shouldFavorite,
        }),
      });

      if (!response.ok) {
        setFavoriteSet((prev) => {
          const next = new Set(prev);
          if (shouldFavorite) {
            next.delete(venueId);
          } else {
            next.add(venueId);
          }
          return next;
        });
      }
    },
    [userId],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-3xl border border-white/10 bg-night-800/80 p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-slate-100">Map view</h2>
          <span className="text-xs uppercase tracking-[0.3em] text-brand-300">
            {filtered.length} results
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <label htmlFor="map-search" className="sr-only">
            Search events and venues
          </label>
          <input
            id="map-search"
            name="map-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by event, venue, or city"
            className="w-full rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500"
          />
        </div>
        <div className="mt-4 h-[360px] overflow-hidden rounded-2xl border border-white/10 sm:h-[420px] lg:h-[520px]">
          <MapboxMap
            markers={filtered}
            className="h-full w-full"
            favoriteVenueIds={favoriteSet}
            isSignedIn={isSignedIn}
            onToggleVenueFavorite={handleToggleVenueFavorite}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-slate-300">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-400 shadow-glow" />
            Events
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]" />
            Venues
          </span>
        </div>
      </div>

      <aside className="rounded-3xl border border-white/10 bg-night-900/70 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl text-slate-100">Listings</h3>
          <span className="text-xs uppercase tracking-[0.3em] text-brand-300">{resultsLabel}</span>
        </div>
        <div className="mt-4 space-y-3 overflow-y-auto pr-1 text-sm text-slate-300">
          {filtered.length > 0 ? (
            filtered.map((marker) => (
              <div
                key={marker.id}
                className="rounded-2xl border border-white/10 bg-night-800/70 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{marker.title}</p>
                    <p className="text-xs text-slate-400">{marker.subtitle}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${typeStyles[marker.type]}`}
                  >
                    {marker.type}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">
              No matches for that search. Try a different keyword.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
