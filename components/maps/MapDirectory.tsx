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

const formatResultCount = (count: number) => `${count} result${count === 1 ? '' : 's'}`;

export default function MapDirectory({
  markers,
  favoriteVenueIds = [],
  isSignedIn = false,
  userId,
}: MapDirectoryProps) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | MapMarker['type']>('ALL');
  const [favoriteSet, setFavoriteSet] = useState<Set<string>>(() => new Set(favoriteVenueIds));
  const [activeView, setActiveView] = useState<'MAP' | 'LIST'>('MAP');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  useEffect(() => {
    setFavoriteSet(new Set(favoriteVenueIds));
  }, [favoriteVenueIds]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return markers.filter((marker) => {
      if (typeFilter !== 'ALL' && marker.type !== typeFilter) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return (
        marker.title.toLowerCase().includes(normalized) ||
        marker.subtitle.toLowerCase().includes(normalized)
      );
    });
  }, [markers, query, typeFilter]);

  useEffect(() => {
    if (!selectedMarkerId) {
      return;
    }
    if (!filtered.some((marker) => marker.id === selectedMarkerId)) {
      setSelectedMarkerId(null);
    }
  }, [filtered, selectedMarkerId]);

  const resultsLabel = query.trim()
    ? `${formatResultCount(filtered.length)} shown of ${formatResultCount(markers.length)}`
    : formatResultCount(markers.length);
  const eventResultsCount = filtered.filter((marker) => marker.type === 'EVENT').length;
  const venueResultsCount = filtered.filter((marker) => marker.type === 'VENUE').length;

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
    <div className="rounded-3xl border border-white/10 bg-night-800/80 p-6 shadow-glow">
      <div className="mb-4 flex items-center justify-center rounded-full border border-white/10 bg-night-900/70 p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setActiveView('MAP')}
          className={`w-full rounded-full px-3 py-2 text-xs uppercase tracking-[0.2em] transition ${
            activeView === 'MAP'
              ? 'bg-brand-400/20 text-brand-100'
              : 'text-slate-300 hover:text-slate-100'
          }`}
        >
          Map
        </button>
        <button
          type="button"
          onClick={() => setActiveView('LIST')}
          className={`w-full rounded-full px-3 py-2 text-xs uppercase tracking-[0.2em] transition ${
            activeView === 'LIST'
              ? 'bg-brand-400/20 text-brand-100'
              : 'text-slate-300 hover:text-slate-100'
          }`}
        >
          List
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className={activeView === 'LIST' ? 'hidden lg:block' : ''}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-slate-100">Map view</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-brand-300">
              {formatResultCount(filtered.length)}
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
              className="w-full rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-400"
            />
            <select
              name="map-type"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as 'ALL' | MapMarker['type'])}
              className="w-full rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-sm text-slate-100 sm:w-auto"
            >
              <option value="ALL">All results</option>
              <option value="EVENT">Events only</option>
              <option value="VENUE">Venues only</option>
            </select>
            {(query.trim() || typeFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setTypeFilter('ALL');
                }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200 transition hover:bg-white/10"
              >
                Reset filters
              </button>
            )}
          </div>
          <div className="mt-4 h-[360px] overflow-hidden rounded-2xl border border-white/10 sm:h-[420px] lg:h-[520px]">
            <MapboxMap
              markers={filtered}
              className="h-full w-full"
              favoriteVenueIds={favoriteSet}
              isSignedIn={isSignedIn}
              onToggleVenueFavorite={handleToggleVenueFavorite}
              selectedMarkerId={selectedMarkerId}
              onSelectMarker={setSelectedMarkerId}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-slate-300">
            <span className="flex items-center gap-2">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/50 bg-brand-400 text-[9px] text-night-950">
                E
              </span>
              Events ({eventResultsCount})
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-white/70 bg-red-500 text-[9px] text-night-950">
                V
              </span>
              Venues ({venueResultsCount})
            </span>
          </div>
        </div>

        <aside
          className={
            activeView === 'MAP'
              ? 'hidden rounded-3xl border border-white/10 bg-night-900/70 p-6 lg:block'
              : 'rounded-3xl border border-white/10 bg-night-900/70 p-6'
          }
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl text-slate-100">Listings</h3>
            <span className="text-xs uppercase tracking-[0.3em] text-brand-300">
              {resultsLabel}
            </span>
          </div>
          <div className="mt-4 space-y-3 overflow-y-auto pr-1 text-sm text-slate-300">
            {filtered.length > 0 ? (
              filtered.map((marker) => (
                <button
                  key={marker.id}
                  type="button"
                  onClick={() => setSelectedMarkerId(marker.id)}
                  className={`w-full rounded-2xl border bg-night-800/70 p-3 text-left transition ${
                    marker.id === selectedMarkerId
                      ? 'border-brand-300/60 ring-2 ring-brand-400/30'
                      : 'border-white/10 hover:border-brand-300/40'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{marker.title}</p>
                      <p className="text-xs text-slate-300">{marker.subtitle}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${typeStyles[marker.type]}`}
                    >
                      {marker.type}
                    </span>
                  </div>
                  {marker.detailHref ? (
                    <a
                      href={marker.detailHref}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-brand-200 transition hover:text-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
                    >
                      View details
                      <span aria-hidden="true">-&gt;</span>
                    </a>
                  ) : null}
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-night-800/70 p-4">
                <p className="text-sm text-slate-300">
                  No matches for the current filters. Try a different keyword or reset filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setTypeFilter('ALL');
                  }}
                  className="mt-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
                >
                  Show all results
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
