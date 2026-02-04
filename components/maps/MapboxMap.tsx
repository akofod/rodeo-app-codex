'use client';

import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';

export type MapMarker = {
  id: string;
  type: 'EVENT' | 'VENUE';
  entityId?: string;
  title: string;
  subtitle: string;
  detail?: string;
  latitude: number;
  longitude: number;
};

type MapboxMapProps = {
  markers: MapMarker[];
  className?: string;
  favoriteVenueIds?: Set<string>;
  isSignedIn?: boolean;
  onToggleVenueFavorite?: (venueId: string, shouldFavorite: boolean) => void;
};

const defaultCenter: [number, number] = [-98.5795, 39.8283];

export default function MapboxMap({
  markers,
  className,
  favoriteVenueIds,
  isSignedIn,
  onToggleVenueFavorite,
}: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current || mapRef.current) {
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: defaultCenter,
      zoom: 3.4,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (markers.length === 0) {
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();

    markers.forEach((marker) => {
      const element = document.createElement('button');
      element.type = 'button';
      element.className =
        marker.type === 'EVENT'
          ? 'h-3 w-3 rounded-full border border-white/70 bg-brand-400 shadow-glow'
          : 'h-3.5 w-3.5 rounded-full border border-red-100 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]';

      const popupContent = document.createElement('div');
      popupContent.className = 'ws-map-popup-content';

      const popupTitle = document.createElement('div');
      popupTitle.className = 'ws-map-popup-title';
      popupTitle.textContent = marker.title;

      const popupSubtitle = document.createElement('div');
      popupSubtitle.className = 'ws-map-popup-subtitle';
      popupSubtitle.textContent = marker.subtitle;

      popupContent.append(popupTitle, popupSubtitle);

      if (marker.detail) {
        const popupDetail = document.createElement('div');
        popupDetail.className = 'ws-map-popup-detail';
        popupDetail.textContent = marker.detail;
        popupContent.append(popupDetail);
      }

      if (marker.type === 'VENUE') {
        const popupActions = document.createElement('div');
        popupActions.className = 'ws-map-popup-actions';

        if (isSignedIn && marker.entityId) {
          const isFavorited = favoriteVenueIds?.has(marker.entityId) ?? false;
          const favoriteButton = document.createElement('button');
          favoriteButton.type = 'button';
          favoriteButton.className = `ws-map-popup-favorite${isFavorited ? ' is-active' : ''}`;
          favoriteButton.setAttribute('aria-pressed', isFavorited ? 'true' : 'false');
          favoriteButton.setAttribute(
            'aria-label',
            isFavorited ? 'Remove from favorites' : 'Add to favorites',
          );

          favoriteButton.innerHTML = `
            <svg aria-hidden="true" viewBox="0 0 24 24" class="ws-map-popup-heart">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            ${isFavorited ? 'Favorited' : 'Favorite'}
          `;

          favoriteButton.addEventListener('click', () => {
            if (!marker.entityId || !onToggleVenueFavorite) {
              return;
            }
            onToggleVenueFavorite(marker.entityId, !isFavorited);
          });

          popupActions.append(favoriteButton);
        } else {
          const signInLink = document.createElement('a');
          signInLink.href = '/sign-in';
          signInLink.className = 'ws-map-popup-signin';
          signInLink.textContent = 'Sign in to favorite';
          popupActions.append(signInLink);
        }

        popupContent.append(popupActions);
      }

      const popup = new mapboxgl.Popup({
        offset: 12,
        className: 'ws-map-popup',
        focusAfterOpen: false,
      }).setDOMContent(popupContent);

      const mapMarker = new mapboxgl.Marker({ element })
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(mapMarker);
      bounds.extend([marker.longitude, marker.latitude]);
    });

    const fitBounds = () => {
      if (bounds.isEmpty()) {
        return;
      }
      map.fitBounds(bounds, { padding: 80, maxZoom: 9 });
    };

    if (map.loaded()) {
      fitBounds();
    } else {
      map.once('load', fitBounds);
    }
  }, [favoriteVenueIds, isSignedIn, markers, onToggleVenueFavorite]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-night-900/70 text-sm text-slate-400">
        Mapbox token is missing. Add NEXT_PUBLIC_MAPBOX_TOKEN to enable the map.
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
